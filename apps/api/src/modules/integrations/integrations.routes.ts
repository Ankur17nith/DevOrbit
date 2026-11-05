import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';
import { syncRateLimiter } from '../../middleware/rateLimit.js';
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
const handleGetGithubOAuthUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = await githubOAuthHandler.getOAuthStatus(req.user!.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

integrationsRouter.get('/github/oauth/url', handleGetGithubOAuthUrl);
integrationsRouter.get('/github/oauth/authorize', handleGetGithubOAuthUrl);
integrationsRouter.get('/github/oauth/start', handleGetGithubOAuthUrl);

integrationsRouter.post('/github/oauth/callback', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.body;
    if (!code) {
      throw new BadRequestError('Authorization code is required');
    }
    const isValid = await githubOAuthHandler.validateAndConsumeState(state, req.user!.id);
    if (!isValid) {
      throw new BadRequestError('Invalid, expired, or tampered OAuth state parameter');
    }
    const tokenResult = await githubOAuthHandler.exchangeCode(code);
    const result = await githubService.connectAccount(req.user!.id, tokenResult.accessToken, {
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn,
      refreshTokenExpiresIn: tokenResult.refreshTokenExpiresIn,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

const handleConnectGithub = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.body.token || req.body.pat;
    if (!token) {
      throw new BadRequestError('Personal Access Token is required');
    }
    const result = await githubService.connectAccount(req.user!.id, token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

integrationsRouter.post('/github/connect', handleConnectGithub);
integrationsRouter.post('/github', handleConnectGithub);

integrationsRouter.post('/github/sync', syncRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await githubService.syncRepositories(req.user!.id);
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
const handleConnectCodeforces = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const handle = req.body.handle || req.body.username;
    if (!handle) {
      throw new BadRequestError('Codeforces handle is required');
    }
    const result = await integrationsService.connectCodeforces(req.user!.id, handle);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
};

integrationsRouter.post('/codeforces/connect', handleConnectCodeforces);
integrationsRouter.post('/codeforces', handleConnectCodeforces);

integrationsRouter.post('/codeforces/sync', syncRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
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
const handleConnectLeetCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username || req.body.handle;
    if (!username) {
      throw new BadRequestError('LeetCode username is required');
    }
    const result = await integrationsService.connectLeetCode(req.user!.id, username);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
};

integrationsRouter.post('/leetcode/connect', handleConnectLeetCode);
integrationsRouter.post('/leetcode', handleConnectLeetCode);

integrationsRouter.post('/leetcode/sync', syncRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await integrationsService.syncLeetCode(req.user!.id);
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
const handleConnectTuf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username || req.body.handle || 'alex_developer';
    if (!username) {
      throw new BadRequestError('Take U Forward username is required');
    }
    const result = await integrationsService.connectTuf(req.user!.id, username);
    res.json({ success: true, data: result.stats });
  } catch (err) {
    next(err);
  }
};

integrationsRouter.post('/tuf/connect', handleConnectTuf);
integrationsRouter.post('/tuf', handleConnectTuf);

integrationsRouter.post('/tuf/sync', syncRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await integrationsService.syncTuf(req.user!.id);
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
