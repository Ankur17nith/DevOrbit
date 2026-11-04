import { Request, Response, NextFunction } from 'express';
import { OpenSourceService } from './opensource.service.js';
import { AuthRequest } from '../../middleware/auth.js';

const ossService = new OpenSourceService();

export class OpenSourceController {
  async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getCatalog(req.query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getTrending(req.query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getIssues(req.query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getGsocOrgs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getGsocOrgs(req.query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getBounties(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getBounties(req.query as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async toggleBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ossService.toggleBookmark(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getUserBookmarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookmarks = await ossService.getUserBookmarks(userId);
      res.json({ success: true, data: bookmarks });
    } catch (err) {
      next(err);
    }
  }

  async getSelfbotConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const repo = String(req.query.repo || '');
      const config = await ossService.getSelfbotConfig(userId, repo);
      res.json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  }

  async updateSelfbotConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const config = await ossService.updateSelfbotConfig(userId, req.body);
      res.json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  }
}
