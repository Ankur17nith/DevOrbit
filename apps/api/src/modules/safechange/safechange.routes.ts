import { Router } from 'express';
import { SafeChangeController } from './safechange.controller.js';

export const safechangeRouter = Router();
const controller = new SafeChangeController();

safechangeRouter.post('/impact', controller.analyzeImpact);
safechangeRouter.post('/migration', controller.checkMigration);
safechangeRouter.get('/quality', controller.getQuality);
