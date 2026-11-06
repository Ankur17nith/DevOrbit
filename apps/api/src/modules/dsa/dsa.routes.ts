import { Router } from 'express';
import { dsaController } from './dsa.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { updateDsaProgressSchema, submitReviewSchema, importProblemsSchema } from './dsa.validation.js';

export const dsaRouter = Router();

dsaRouter.get('/problems', optionalAuthenticate, dsaController.getProblems);
dsaRouter.post('/problems/:problemId/progress', authenticate, validate(updateDsaProgressSchema), dsaController.updateProgress);
dsaRouter.get('/analytics', authenticate, dsaController.getAnalytics);
dsaRouter.get('/revision-queue', authenticate, dsaController.getRevisionQueue);
dsaRouter.post('/review/:problemId', authenticate, validate(submitReviewSchema), dsaController.submitReview);
dsaRouter.get('/recommendations', authenticate, dsaController.getRecommendations);
dsaRouter.post('/import', authenticate, validate(importProblemsSchema), dsaController.importProblems);
