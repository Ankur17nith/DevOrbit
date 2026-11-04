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

// Get workspace details (IDOR protected: must be a member)
workspacesRouter.get('/:workspaceId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const workspaceId = String(req.params.workspaceId);

    const membership = await prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
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

    if (!membership) {
      throw new ForbiddenError('Access denied: You are not a member of this workspace');
    }

    res.json({
      success: true,
      data: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        description: membership.workspace.description,
        role: membership.role,
        owner: membership.workspace.owner,
        members: membership.workspace.memberships.map(m => ({
          userId: m.user.id,
          username: m.user.username,
          name: m.user.name,
          role: m.role,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Delete workspace (Only Owner)
workspacesRouter.delete('/:workspaceId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const workspaceId = String(req.params.workspaceId);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete this workspace');
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });
    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Remove member from workspace (Owner/Admin only)
workspacesRouter.delete('/:workspaceId/members/:targetUserId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const workspaceId = String(req.params.workspaceId);
    const targetUserId = String(req.params.targetUserId);

    const callerMembership = await prisma.workspaceMembership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!callerMembership || !['OWNER', 'ADMIN'].includes(callerMembership.role)) {
      throw new ForbiddenError('Only workspace Owners and Admins can remove members');
    }

    const targetMembership = await prisma.workspaceMembership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });

    if (!targetMembership) {
      throw new NotFoundError('Target member not found in workspace');
    }

    if (targetMembership.role === 'OWNER') {
      throw new ForbiddenError('Cannot remove workspace owner');
    }

    await prisma.workspaceMembership.delete({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
});
