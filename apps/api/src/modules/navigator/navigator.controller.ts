import { Response, NextFunction } from 'express';
import { NavigatorService } from './navigator.service.js';
import { SymbolKind } from './navigator.types.js';
import { AuthRequest } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';

export class NavigatorController {
  private service: NavigatorService;

  constructor() {
    this.service = new NavigatorService();
  }

  public indexRepository = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 'default';
      const subPath = typeof req.body?.subPath === 'string' ? req.body.subPath : undefined;
      const summary = await this.service.indexRepository(userId, subPath);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      next(err);
    }
  };

  public getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 'default';
      const summary = await this.service.getSummary(userId);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      next(err);
    }
  };

  public searchSymbols = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 'default';
      const q = (req.query.q as string) || '';
      const kind = req.query.kind as SymbolKind | undefined;
      const results = this.service.searchSymbols(userId, q, kind);
      res.json({ success: true, data: { count: results.length, symbols: results } });
    } catch (err: any) {
      next(err);
    }
  };

  public getGraph = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 'default';
      const graph = this.service.getGraph(userId);
      res.json({ success: true, data: graph });
    } catch (err: any) {
      next(err);
    }
  };

  public getFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 'default';
      const filePath = req.query.filePath as string;
      if (!filePath) {
        throw new BadRequestError('filePath is required');
      }
      const details = await this.service.getFileDetails(userId, filePath);
      res.json({ success: true, data: details });
    } catch (err: any) {
      next(err);
    }
  };
}
