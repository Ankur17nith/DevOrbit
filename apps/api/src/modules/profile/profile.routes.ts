import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  updateProfileSchema,
  upsertSkillSchema,
  recommendationFeedbackSchema,
  getRecommendationsSchema,
} from './profile.validation.js';

export const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', profileController.getUnifiedProfile);
profileRouter.put('/', validate(updateProfileSchema), profileController.updateProfile);
profileRouter.post('/skills', validate(upsertSkillSchema), profileController.upsertSkill);
profileRouter.delete('/skills/:skillName', profileController.removeSkill);
profileRouter.post('/readme/sync', profileController.syncReadmeSignals);
profileRouter.get('/recommendations', validate(getRecommendationsSchema), profileController.getRecommendations);
profileRouter.post('/recommendations/feedback', validate(recommendationFeedbackSchema), profileController.recordFeedback);
