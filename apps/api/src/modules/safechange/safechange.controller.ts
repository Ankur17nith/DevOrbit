import { Request, Response, NextFunction } from 'express';
import { SafeChangeService } from './safechange.service.js';
import { BadRequestError } from '../../lib/errors.js';

export class SafeChangeController {
  private service: SafeChangeService;

  constructor() {
    this.service = new SafeChangeService();
  }

  public analyzeImpact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filePath } = req.body;
      if (!filePath || typeof filePath !== 'string') {
        throw new BadRequestError('filePath is required');
      }

      const impact = await this.service.analyzeImpact(filePath);
      res.json({ success: true, data: { impact } });
    } catch (err: any) {
      next(err);
    }
  };

  public checkMigration = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemaContent } = req.body;
      if (!schemaContent || typeof schemaContent !== 'string') {
        throw new BadRequestError('schemaContent is required');
      }

      const report = this.service.checkMigrationSafety(schemaContent);
      res.json({ success: true, data: { report } });
    } catch (err: any) {
      next(err);
    }
  };

  public getQuality = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const quality = this.service.auditQuality();
      res.json({ success: true, data: { quality } });
    } catch (err: any) {
      next(err);
    }
  };
}
