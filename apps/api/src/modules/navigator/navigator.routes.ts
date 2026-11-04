import { Router } from 'express';
import { NavigatorController } from './navigator.controller.js';

export const navigatorRouter = Router();
const controller = new NavigatorController();

navigatorRouter.post('/index', controller.indexRepository);
navigatorRouter.get('/summary', controller.getSummary);
navigatorRouter.get('/symbols', controller.searchSymbols);
navigatorRouter.get('/graph', controller.getGraph);
navigatorRouter.get('/file', controller.getFile);
