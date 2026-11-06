import { Router } from 'express';
import { NavigatorController } from './navigator.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const navigatorRouter = Router();
const controller = new NavigatorController();

navigatorRouter.use(authenticate);

navigatorRouter.post('/index', controller.indexRepository);
navigatorRouter.get('/summary', controller.getSummary);
navigatorRouter.get('/symbols', controller.searchSymbols);
navigatorRouter.get('/graph', controller.getGraph);
navigatorRouter.get('/file', controller.getFile);
