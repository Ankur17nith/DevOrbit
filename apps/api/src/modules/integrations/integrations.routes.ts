import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';
import { integrationsService } from './integrations.service.js';
import { githubService } from '../github/github.service.js';
import { githubOAuthHandler } from './github.oauth.js';

export const integrationsRouter = Router();

// All integration endpoints require authentication
integrationsRouter.use(authenticate);

// 1. Unified Status Endpoint
integrationsRouter.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = await integrationsService.getAllStatus(req.user!.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// 2. GitHub Integration Endpoints
integrationsRouter.get('/github/oauth/url', (req: AuthRequest, res: Response) => {
  const state = `user_${req.user!.id}_${Date.now()}`;
  const status = githubOAuthHandler.getOAuthStatus(state);
  res.json({ success: true, data: status });
});

integrationsRouter.post('/github/oauth/callback', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      throw new BadRequestError('Authorization code is required');
    }
    const token = await githubOAuthHandler.exchangeCode(code);
    const result = await githubService.connectAccount(req.user!.id, token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.post('/github/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new BadRequestError('Personal Access Token is required');
    }
    const result = await githubService.connectAccount(req.user!.id, token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.delete('/github', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await githubService.disconnectAccount(req.user!.id);
    res.json({ success: true, message: 'GitHub account disconnected' });
  } catch (err) {
    next(err);
  }
});

// 3. Codeforces Endpoints
integrationsRouter.post('/codeforces/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { handle } = req.body;
    if (!handle) {
      throw new BadRequestError('Codeforces handle is required');
    }
    const result = await integrationsService.connectCodeforces(req.user!.id, handle);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.post('/codeforces/sync', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await integrationsService.syncCodeforces(req.user!.id);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.delete('/codeforces', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await integrationsService.disconnectCodeforces(req.user!.id);
    res.json({ success: true, message: 'Codeforces account disconnected' });
  } catch (err) {
    next(err);
  }
});

// 4. LeetCode Endpoints
integrationsRouter.post('/leetcode/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new BadRequestError('LeetCode username is required');
    }
    const result = await integrationsService.connectLeetCode(req.user!.id, username);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.post('/leetcode/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (!payload || !payload.username) {
      throw new BadRequestError('Import payload must include username');
    }
    const result = await integrationsService.importLeetCodeData(req.user!.id, payload);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.delete('/leetcode', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await integrationsService.disconnectLeetCode(req.user!.id);
    res.json({ success: true, message: 'LeetCode account disconnected' });
  } catch (err) {
    next(err);
  }
});

// 5. Take U Forward Endpoints
integrationsRouter.post('/tuf/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new BadRequestError('Take U Forward username is required');
    }
    const result = await integrationsService.connectTuf(req.user!.id, username);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.post('/tuf/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (!payload || !payload.username) {
      throw new BadRequestError('TUF import payload must include username');
    }
    const result = await integrationsService.importTufData(req.user!.id, payload);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
});

integrationsRouter.delete('/tuf', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await integrationsService.disconnectTuf(req.user!.id);
    res.json({ success: true, message: 'Take U Forward account disconnected' });
  } catch (err) {
    next(err);
  }
});
