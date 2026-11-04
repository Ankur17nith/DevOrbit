import { Router } from 'express';
import { githubController } from './github.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { syncRateLimiter } from '../../middleware/rateLimit.js';

const router = Router();

// All GitHub intelligence routes require authentication
router.use(authenticate);

router.post('/token', githubController.connectToken);
router.delete('/token', githubController.disconnectToken);
router.get('/status', githubController.getStatus);
router.post('/sync', syncRateLimiter, githubController.triggerSync);
router.get('/profile', githubController.getProfileIntelligence);
router.get('/repositories', githubController.getRepositories);

export const githubRouter = router;
