import { Router } from 'express';
import { OpenSourceController } from './opensource.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const opensourceRouter = Router();
const controller = new OpenSourceController();

// Public Discovery Endpoints
opensourceRouter.get('/catalog', controller.getCatalog);
opensourceRouter.get('/trending', controller.getTrending);
opensourceRouter.get('/issues', controller.getIssues);
opensourceRouter.get('/gsoc', controller.getGsocOrgs);
opensourceRouter.get('/bounties', controller.getBounties);
opensourceRouter.get('/programs', controller.getPrograms);

// Authenticated Skill Matching & Contribution Pipeline
opensourceRouter.get('/recommendations', authenticate, controller.getRecommendations);
opensourceRouter.get('/issues/:issueId/match', authenticate, controller.matchIssueSkills);
opensourceRouter.get('/pipeline', authenticate, controller.getPipeline);
opensourceRouter.post('/pipeline', authenticate, controller.addToPipeline);
opensourceRouter.patch('/pipeline/:id', authenticate, controller.updatePipelineStage);
opensourceRouter.delete('/pipeline/:id', authenticate, controller.removeFromPipeline);
opensourceRouter.post('/opportunities/monitor', authenticate, controller.monitorOpportunities);

// Authenticated User Bookmarking & Selfbot
opensourceRouter.post('/bookmarks/toggle', authenticate, controller.toggleBookmark);
opensourceRouter.get('/bookmarks', authenticate, controller.getUserBookmarks);
opensourceRouter.get('/selfbot/config', authenticate, controller.getSelfbotConfig);
opensourceRouter.post('/selfbot/config', authenticate, controller.updateSelfbotConfig);
