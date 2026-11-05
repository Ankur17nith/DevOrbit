import { Request, Response, NextFunction } from 'express';
import { OpenSourceService } from './opensource.service.js';
import { organizationService } from './organization.service.js';
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

  async getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ossService.getPrograms();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async matchIssueSkills(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const issueId = String(req.params.issueId);
      const data = await ossService.matchIssueSkills(userId, issueId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = Number(req.query.limit) || 10;
      const data = await ossService.getRecommendedOpportunities(userId, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // Contribution Pipeline
  async getPipeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stage = typeof req.query.stage === 'string' ? req.query.stage : undefined;
      const data = await ossService.getPipeline(userId, stage);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async addToPipeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await ossService.addToPipeline(userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updatePipelineStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const pipelineItemId = String(req.params.id);
      const data = await ossService.updatePipelineStage(userId, pipelineItemId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async removeFromPipeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const pipelineItemId = String(req.params.id);
      const result = await ossService.removeFromPipeline(userId, pipelineItemId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async monitorOpportunities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ossService.monitorOpportunities(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // Multi-user Bookmarking
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

  // GitHub Selfbot module
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

  // Multi-Platform Organizations
  async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const { platforms, technologies, techLogic, search, hasBeginnerIssues, year, page, limit, sortBy } = req.query;
      const parsedPlatforms = typeof platforms === 'string' ? platforms.split(',').filter(Boolean) : (Array.isArray(platforms) ? (platforms as string[]) : undefined);
      const parsedTechs = typeof technologies === 'string' ? technologies.split(',').filter(Boolean) : (Array.isArray(technologies) ? (technologies as string[]) : undefined);
      
      const data = await organizationService.getOrganizations({
        platforms: parsedPlatforms,
        technologies: parsedTechs,
        techLogic: techLogic === 'AND' ? 'AND' : 'OR',
        search: typeof search === 'string' ? search : undefined,
        hasBeginnerIssues: String(hasBeginnerIssues) === 'true',
        year: year ? Number(year) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: (sortBy as any) || 'projects',
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getOrganizationDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await organizationService.getOrganizationDetail(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async toggleSaveOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);
      const { notes } = req.body;
      const result = await organizationService.toggleSaveOrganization(userId, id, notes);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getUserSavedOrganizations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await organizationService.getUserSavedOrganizations(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
