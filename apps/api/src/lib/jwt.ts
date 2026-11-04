import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export function generateToken(payload: TokenPayload, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
