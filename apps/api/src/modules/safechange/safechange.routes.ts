import { Router } from 'express';
import { SafeChangeController } from './safechange.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const safechangeRouter = Router();
const controller = new SafeChangeController();

safechangeRouter.use(authenticate);

safechangeRouter.post('/impact', controller.analyzeImpact);
safechangeRouter.post('/migration', controller.checkMigration);
safechangeRouter.get('/quality', controller.getQuality);
