import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.getUnifiedProfile);
profileRouter.put('/', profileController.updateProfile);
profileRouter.post('/skills', profileController.upsertSkill);
profileRouter.delete('/skills/:skillName', profileController.removeSkill);
profileRouter.post('/readme/sync', profileController.syncReadmeSignals);
profileRouter.get('/recommendations', profileController.getRecommendations);
profileRouter.post('/recommendations/feedback', profileController.recordFeedback);
