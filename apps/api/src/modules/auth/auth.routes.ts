import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimit.js';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/register', authRateLimiter, validate(registerSchema), controller.register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), controller.login);
authRouter.post('/logout', authenticate, controller.logout);
authRouter.get('/me', authenticate, controller.me);
