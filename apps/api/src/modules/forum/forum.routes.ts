import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors.js';

export const forumRouter = Router();

// List posts
forumRouter.get('/posts', optionalAuthenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.forumPost.findMany({
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: posts.map(p => ({
        ...p,
        tags: p.tagsJson ? JSON.parse(p.tagsJson) : [],
        replyCount: p._count.replies,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Create post
forumRouter.post('/posts', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, tags } = req.body;
    if (!title || !content) {
      throw new BadRequestError('Title and content are required');
    }

    const post = await prisma.forumPost.create({
      data: {
        userId,
        title,
        content,
        tagsJson: JSON.stringify(tags || []),
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

// Reply to post
forumRouter.post('/posts/:postId/replies', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const postId = String(req.params.postId);
    const { content } = req.body;

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const reply = await prisma.forumReply.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, data: reply });
  } catch (err) {
    next(err);
  }
});

// Delete post (Author or Admin only)
forumRouter.delete('/posts/:postId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const postId = String(req.params.postId);

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own forum posts');
    }

    await prisma.forumReply.deleteMany({ where: { postId } });
    await prisma.forumPost.delete({ where: { id: postId } });

    res.json({ success: true, message: 'Forum post deleted successfully' });
  } catch (err) {
    next(err);
  }
});
