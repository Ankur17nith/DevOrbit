import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors.js';

export const workspacesRouter = Router();

// List user workspaces
workspacesRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const memberships = await prisma.workspaceMembership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: { select: { id: true, username: true, name: true, avatarUrl: true } },
            memberships: {
              include: {
                user: { select: { id: true, username: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: memberships.map(m => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        description: m.workspace.description,
        role: m.role,
        owner: m.workspace.owner,
        membersCount: m.workspace.memberships.length,
        members: m.workspace.memberships.map(mem => ({
          userId: mem.user.id,
          username: mem.user.username,
          name: mem.user.name,
          role: mem.role,
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Create workspace
workspacesRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      throw new BadRequestError('Workspace name and slug are required');
    }

    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestError('Workspace slug is already in use');
    }

    const ws = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        ownerId: userId,
        memberships: {
          create: [{ userId, role: 'OWNER' }],
        },
      },
      include: {
        memberships: true,
      },
    });

    res.status(201).json({ success: true, data: ws });
  } catch (err) {
    next(err);
  }
});

// Add member to workspace
workspacesRouter.post('/:workspaceId/members', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const workspaceId = String(req.params.workspaceId);
    const { targetUsername, role } = req.body;

    const callerMembership = await prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!callerMembership || !['OWNER', 'ADMIN'].includes(callerMembership.role)) {
      throw new ForbiddenError('Only workspace Owners and Admins can invite members');
    }

    const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!targetUser) {
      throw new NotFoundError('Target user not found');
    }

    const newMembership = await prisma.workspaceMembership.create({
      data: {
        workspaceId,
        userId: targetUser.id,
        role: role || 'MEMBER',
      },
    });

    res.status(201).json({ success: true, data: newMembership });
  } catch (err) {
    next(err);
  }
});
