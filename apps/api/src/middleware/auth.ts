import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/index.js';
import { verifyToken, TokenPayload } from '../lib/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)devorbit_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

import crypto from 'crypto';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    return next(new UnauthorizedError('Authentication token missing or invalid'));
  }

  try {
    const payload = verifyToken(token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { token: tokenHash },
          { token: token },
        ],
      },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session has expired or is invalid');
    }

    req.user = {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
    };

    next();
  } catch (err: any) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions for this resource');
    }
    next();
  };
}

export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    prisma.session.findFirst({
      where: {
        OR: [
          { token: tokenHash },
          { token: token },
        ],
      },
      include: { user: true },
    }).then(session => {
      if (session && session.expiresAt >= new Date()) {
        req.user = {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          role: session.user.role,
        };
      }
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}
