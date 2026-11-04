import crypto from 'node:crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const SALT = 'devorbit_local_integration_salt_2026';

function getEncryptionKey(): Buffer {
  const secret = process.env.DEVORBIT_ENCRYPTION_KEY || config.jwtSecret;
  return crypto.scryptSync(secret, SALT, 32);
}

/**
 * Encrypts sensitive string secrets using AES-256-GCM authenticated encryption.
 * Output format: `ivHex:authTagHex:encryptedHex`
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted secrets and validates the authentication tag.
 * Throws an error if tampering or invalid key is detected.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Safely masks an access token for display in UI or logs without leaking sensitive entropy.
 * e.g. "ghp_1234567890abcdef" -> "ghp_***cdef"
 */
export function maskSecretToken(token: string): string {
  if (!token) return '';
  if (token.length <= 8) return '****';
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}***${suffix}`;
}
