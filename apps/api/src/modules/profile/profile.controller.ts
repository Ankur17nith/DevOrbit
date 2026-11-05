import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { profileService } from './profile.service.js';
import { recommendationEngine, RecommendationCategory } from '../recommendations/recommendation.engine.js';

export class ProfileController {
  async getUnifiedProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await profileService.getUnifiedProfile(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await profileService.updateProfile(userId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async upsertSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await profileService.upsertSkill(userId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async removeSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const skillName = String(req.params.skillName);
      const data = await profileService.removeSkill(userId, skillName);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async syncReadmeSignals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { content, markdown, repositoryFullName } = req.body;
      const data = await profileService.processReadmeSignals(userId, content || markdown || '', repositoryFullName);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { category, limit } = req.query;
      const data = await recommendationEngine.getRecommendations(userId, {
        category: category ? (category as RecommendationCategory) : undefined,
        limit: limit ? Number(limit) : 15,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async recordFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await recommendationEngine.recordFeedback(userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();
