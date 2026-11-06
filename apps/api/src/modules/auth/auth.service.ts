import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/index.js';
import { generateToken } from '../../lib/jwt.js';
import { BadRequestError, UnauthorizedError } from '../../lib/errors.js';

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function purgeExpiredSessions(): Promise<number> {
  const now = new Date();
  const res = await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  return res.count;
}

export class AuthService {
  async register(data: {
    email: string;
    username: string;
    password: string;
    name?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanUsername = data.username.trim();

    if (data.password.length > 72) {
      throw new BadRequestError('Password cannot exceed 72 characters');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    try {
      return await prisma.$transaction(async (tx) => {
        const existingEmail = await tx.user.findUnique({ where: { email: cleanEmail } });
        if (existingEmail) {
          throw new BadRequestError('Email is already registered');
        }

        const existingUsername = await tx.user.findUnique({ where: { username: cleanUsername } });
        if (existingUsername) {
          throw new BadRequestError('Username is already taken');
        }

        const user = await tx.user.create({
          data: {
            email: cleanEmail,
            username: cleanUsername,
            passwordHash,
            name: data.name || cleanUsername,
            preference: {
              create: {
                theme: 'dark',
                ecoMode: true,
                notifyDesktop: true,
              },
            },
          },
          include: {
            preference: true,
          },
        });

        // Create session
        const token = generateToken({
          userId: user.id,
          username: user.username,
          email: user.email,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const tokenHash = hashSessionToken(token);
        await tx.session.create({
          data: {
            userId: user.id,
            token: tokenHash,
            expiresAt,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
          },
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            preference: user.preference,
          },
          token,
        };
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestError('Email or username is already registered');
      }
      throw err;
    }
  }

  async login(data: {
    login: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const cleanLogin = data.login.trim();
    const lowerLogin = cleanLogin.toLowerCase();

    if (data.password.length > 72) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lowerLogin },
          { username: cleanLogin },
        ],
      },
      include: {
        preference: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = hashSessionToken(token);
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preference: user.preference,
      },
      token,
    };
  }

  async logout(token: string) {
    const tokenHash = hashSessionToken(token);
    await prisma.session.deleteMany({
      where: {
        OR: [
          { token: tokenHash },
          { token },
        ],
      },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: true,
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      preference: user.preference,
      workspaces: user.memberships.map(m => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
      })),
    };
  }
}
