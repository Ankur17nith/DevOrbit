import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import { githubRouter } from './modules/github/github.routes.js';
import { navigatorRouter } from './modules/navigator/navigator.routes.js';
import { fixRouter } from './modules/fix/fix.routes.js';
import { safechangeRouter } from './modules/safechange/safechange.routes.js';
import { integrationsRouter } from './modules/integrations/integrations.routes.js';

export const app = express();

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow local development UI and Vite assets
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

import { systemRouter } from './modules/system/system.routes.js';

// Public Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'devorbit-api',
    version: '0.1.0',
    time: new Date().toISOString(),
  });
});

// Mount Versioned API Modules
const v1Router = express.Router();
v1Router.use('/system', systemRouter);

v1Router.use('/auth', authRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/opensource', opensourceRouter);
v1Router.use('/dsa', dsaRouter);
v1Router.use('/workspaces', workspacesRouter);
v1Router.use('/forum', forumRouter);
v1Router.use('/ai', aiRouter);
v1Router.use('/recon', reconRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/github', githubRouter);
v1Router.use('/navigator', navigatorRouter);
v1Router.use('/fix', fixRouter);
v1Router.use('/safechange', safechangeRouter);
v1Router.use('/integrations', integrationsRouter);

app.use('/api/v1', v1Router);

// Global Error Handler
app.use(errorHandler);
