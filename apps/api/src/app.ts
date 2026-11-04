import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import { authRouter } from './modules/auth/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { opensourceRouter } from './modules/opensource/opensource.routes.js';
import { dsaRouter } from './modules/dsa/dsa.routes.js';
import { workspacesRouter } from './modules/workspaces/workspaces.routes.js';
import { forumRouter } from './modules/forum/forum.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { reconRouter } from './modules/recon/recon.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';

export const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Public Health & System Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'devorbit-api',
    version: '0.1.0',
    time: new Date().toISOString(),
  });
});

// Mount Versioned API Modules
const v1Router = express.Router();
v1Router.use('/auth', authRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/opensource', opensourceRouter);
v1Router.use('/dsa', dsaRouter);
v1Router.use('/workspaces', workspacesRouter);
v1Router.use('/forum', forumRouter);
v1Router.use('/ai', aiRouter);
v1Router.use('/recon', reconRouter);
v1Router.use('/notifications', notificationsRouter);

app.use('/api/v1', v1Router);

// Global Error Handler
app.use(errorHandler);
