import { Request, Response } from 'express';
import { FixService } from './fix.service.js';

export class FixController {
  private service: FixService;

  constructor() {
    this.service = new FixService();
  }

  public analyze = (req: Request, res: Response) => {
    try {
      const { rawLog, workspaceRoot } = req.body;
      if (!rawLog || typeof rawLog !== 'string') {
        return res.status(400).json({ success: false, error: 'rawLog is required' });
      }

      const analysis = this.service.analyzeError(rawLog, workspaceRoot);
      res.json({ success: true, data: { analysis } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public propose = (req: Request, res: Response) => {
    try {
      const { analysis, workspaceRoot } = req.body;
      if (!analysis) {
        return res.status(400).json({ success: false, error: 'analysis object is required' });
      }

      const patch = this.service.proposePatch(analysis, workspaceRoot);
      res.json({ success: true, data: { patch } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public verify = (req: Request, res: Response) => {
    try {
      const { patch } = req.body;
      if (!patch) {
        return res.status(400).json({ success: false, error: 'patch object is required' });
      }

      const verification = this.service.verifyPatch(patch);
      res.json({ success: true, data: { verification } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getSamples = (_req: Request, res: Response) => {
    try {
      const samples = this.service.getSampleErrors();
      res.json({ success: true, data: { samples } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
