import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { githubService } from './github.service.js';
import { prisma } from '../../config/index.js';

export class GitHubController {
  async connectToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await githubService.connectAccount(req.user!.id, token);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async disconnectToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await githubService.disconnectAccount(req.user!.id);
      res.status(200).json({
        success: true,
        message: 'GitHub account successfully disconnected',
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = await githubService.getIntegrationStatus(req.user!.id);
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  async triggerSync(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await githubService.syncRepositories(req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfileIntelligence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await githubService.getProfileIntelligence(req.user!.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  async getRepositories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, language } = req.query;
      const where: any = { userId: req.user!.id };

      if (typeof search === 'string' && search.trim()) {
        where.OR = [
          { name: { contains: search.trim() } },
          { description: { contains: search.trim() } },
        ];
      }

      if (typeof language === 'string' && language.trim() && language !== 'All') {
        where.language = language.trim();
      }

      const repos = await prisma.userGithubRepo.findMany({
        where,
        orderBy: { stargazersCount: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: repos.map(r => ({
          ...r,
          languages: r.languagesJson ? JSON.parse(r.languagesJson) : {},
          topics: r.topicsJson ? JSON.parse(r.topicsJson) : [],
        })),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const githubController = new GitHubController();
