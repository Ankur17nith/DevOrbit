import { Router } from 'express';
import { DsaController } from './dsa.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

export const dsaRouter = Router();
const controller = new DsaController();

dsaRouter.get('/problems', optionalAuthenticate, controller.getProblems);
dsaRouter.post('/problems/:problemId/progress', authenticate, controller.updateProgress);
dsaRouter.get('/analytics', authenticate, controller.getAnalytics);
dsaRouter.get('/revisions', authenticate, controller.getRevisionQueue);
