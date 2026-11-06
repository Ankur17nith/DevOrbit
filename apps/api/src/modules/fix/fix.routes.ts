import { Router } from 'express';
import { FixController } from './fix.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const fixRouter = Router();
const controller = new FixController();

fixRouter.use(authenticate);

fixRouter.post('/analyze', controller.analyze);
fixRouter.post('/propose', controller.propose);
fixRouter.post('/verify', controller.verify);
fixRouter.get('/samples', controller.getSamples);
