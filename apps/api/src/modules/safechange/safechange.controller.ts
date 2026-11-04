import { Request, Response } from 'express';
import { SafeChangeService } from './safechange.service.js';

export class SafeChangeController {
  private service: SafeChangeService;

  constructor() {
    this.service = new SafeChangeService();
  }

  public analyzeImpact = async (req: Request, res: Response) => {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ success: false, error: 'filePath is required' });
      }

      const impact = await this.service.analyzeImpact(filePath);
      res.json({ success: true, data: { impact } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public checkMigration = (req: Request, res: Response) => {
    try {
      const { schemaContent } = req.body;
      if (!schemaContent || typeof schemaContent !== 'string') {
        return res.status(400).json({ success: false, error: 'schemaContent is required' });
      }

      const report = this.service.checkMigrationSafety(schemaContent);
      res.json({ success: true, data: { report } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getQuality = (_req: Request, res: Response) => {
    try {
      const quality = this.service.auditQuality();
      res.json({ success: true, data: { quality } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
