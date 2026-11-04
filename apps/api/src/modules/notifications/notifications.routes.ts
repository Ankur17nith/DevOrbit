import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.get('/unread-count', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    res.json({ success: true, data: { unreadCount: count } });
  } catch (err) {
    next(err);
  }
});

// Orbit Pulse: Background opportunity and deadline monitor
notificationsRouter.post('/pulse', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const threshold = new Date(now.getTime() + 72 * 3600 * 1000); // 72 hours

    // Find upcoming program deadlines
    const urgentPrograms = await prisma.ossProgram.findMany({
      where: {
        deadlineDate: {
          gte: now,
          lte: threshold,
        },
      },
    });

    let newNotificationsCount = 0;

    for (const prog of urgentPrograms) {
      const exists = await prisma.notification.findFirst({
        where: {
          userId,
          title: `Deadline Approaching: ${prog.name}`,
        },
      });

      if (!exists) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Deadline Approaching: ${prog.name}`,
            message: `Applications for ${prog.name} close soon (${new Date(prog.deadlineDate!).toLocaleDateString()}). Submit your application materials now!`,
            type: 'OPPORTUNITY_DEADLINE',
            linkUrl: prog.website || undefined,
            isRead: false,
          },
        });
        newNotificationsCount++;
      }
    }

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: {
        newNotificationsCount,
        unreadCount,
        programsMonitored: urgentPrograms.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

