import { Router, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';

export const dashboardRouter = Router();
const service = new DashboardService();

dashboardRouter.get('/summary', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.getDashboardSummary(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
