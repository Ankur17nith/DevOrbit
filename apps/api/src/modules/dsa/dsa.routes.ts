import { Router } from 'express';
import { dsaController } from './dsa.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

export const dsaRouter = Router();

dsaRouter.get('/problems', optionalAuthenticate, dsaController.getProblems);
dsaRouter.post('/problems/:problemId/progress', authenticate, dsaController.updateProgress);
dsaRouter.get('/analytics', authenticate, dsaController.getAnalytics);
dsaRouter.get('/revision-queue', authenticate, dsaController.getRevisionQueue);
dsaRouter.post('/review/:problemId', authenticate, dsaController.submitReview);
dsaRouter.get('/recommendations', authenticate, dsaController.getRecommendations);
dsaRouter.post('/import', authenticate, dsaController.importProblems);
