import { Request, Response } from 'express';
import { NavigatorService } from './navigator.service.js';
import { SymbolKind } from './navigator.types.js';

export class NavigatorController {
  private service: NavigatorService;

  constructor() {
    this.service = new NavigatorService();
  }

  public indexRepository = async (req: Request, res: Response) => {
    try {
      const { targetPath } = req.body;
      const summary = await this.service.indexRepository(targetPath);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getSummary = async (req: Request, res: Response) => {
    try {
      const targetPath = req.query.targetPath as string | undefined;
      const summary = await this.service.getSummary(targetPath);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public searchSymbols = (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const kind = req.query.kind as SymbolKind | undefined;
      const results = this.service.searchSymbols(q, kind);
      res.json({ success: true, data: { count: results.length, symbols: results } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getGraph = (_req: Request, res: Response) => {
    try {
      const graph = this.service.getGraph();
      res.json({ success: true, data: graph });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getFile = (req: Request, res: Response) => {
    try {
      const filePath = req.query.filePath as string;
      if (!filePath) {
        return res.status(400).json({ success: false, error: 'filePath is required' });
      }
      const details = this.service.getFileDetails(filePath);
      res.json({ success: true, data: details });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  };
}
