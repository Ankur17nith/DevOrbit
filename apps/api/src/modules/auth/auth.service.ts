import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/index.js';
import { generateToken } from '../../lib/jwt.js';
import { BadRequestError, UnauthorizedError } from '../../lib/errors.js';

export class AuthService {
  async register(data: { email: string; username: string; password: string; name?: string }) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw new BadRequestError('Email is already registered');
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      throw new BadRequestError('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        name: data.name || data.username,
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

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
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

  async login(data: { login: string; password: string }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.login },
          { username: data.login },
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

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
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
    await prisma.session.deleteMany({
      where: { token },
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
