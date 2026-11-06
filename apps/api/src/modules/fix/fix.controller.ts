import { Request, Response, NextFunction } from 'express';
import { FixService } from './fix.service.js';
import { BadRequestError } from '../../lib/errors.js';

export class FixController {
  private service: FixService;

  constructor() {
    this.service = new FixService();
  }

  public analyze = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rawLog } = req.body;
      if (!rawLog || typeof rawLog !== 'string') {
        throw new BadRequestError('rawLog is required and must be a string');
      }

      if (rawLog.length > 20480) {
        throw new BadRequestError('Log exceeds 20KB limit');
      }

      const analysis = this.service.analyzeError(rawLog);
      res.json({ success: true, data: { analysis } });
    } catch (err: any) {
      next(err);
    }
  };

  public propose = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { analysis } = req.body;
      if (!analysis) {
        throw new BadRequestError('analysis object is required');
      }

      const patchResult = this.service.proposePatch(analysis);
      res.json({
        success: true,
        data: {
          patch: patchResult.patch,
          reason: patchResult.reason,
        },
      });
    } catch (err: any) {
      next(err);
    }
  };

  public verify = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patch } = req.body;
      if (!patch) {
        throw new BadRequestError('patch object is required');
      }

      const verification = this.service.verifyPatch(patch);
      res.json({ success: true, data: { verification } });
    } catch (err: any) {
      next(err);
    }
  };

  public getSamples = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const samples = this.service.getSampleErrors();
      res.json({ success: true, data: { samples } });
    } catch (err: any) {
      next(err);
    }
  };
}
