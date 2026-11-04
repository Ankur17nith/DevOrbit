import { Request, Response, NextFunction } from 'express';
import { DsaService } from './dsa.service.js';
import { AuthRequest } from '../../middleware/auth.js';

const dsaService = new DsaService();

export class DsaController {
  async getProblems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        ...req.query,
        userId: req.user?.id,
      };
      const data = await dsaService.getProblems(query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const problemId = String(req.params.problemId);
      const progress = await dsaService.updateProblemProgress(userId, problemId, req.body);
      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const analytics = await dsaService.getUserAnalytics(userId);
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }

  async getRevisionQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const queue = await dsaService.getRevisionQueue(userId);
      res.json({ success: true, data: queue });
    } catch (err) {
      next(err);
    }
  }
}
