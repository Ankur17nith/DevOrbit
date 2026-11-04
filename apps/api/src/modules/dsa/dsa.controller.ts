import { Response, NextFunction } from 'express';
import { dsaService } from './dsa.service.js';
import { AuthRequest } from '../../middleware/auth.js';

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

  async submitReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const problemId = String(req.params.problemId);
      const { rating } = req.body;
      const updated = await dsaService.submitSpacedReview(userId, problemId, Number(rating));
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const recommendations = await dsaService.getRecommendations(userId);
      res.json({ success: true, data: recommendations });
    } catch (err) {
      next(err);
    }
  }

  async importProblems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, content, defaultCategory } = req.body;
      const result = await dsaService.importProblems(type || 'JSON', content, defaultCategory);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const dsaController = new DsaController();
