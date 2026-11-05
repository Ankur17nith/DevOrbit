import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { config, prisma } from './config/index.js';
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
import { systemRouter } from './modules/system/system.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';

export const app = express();

// Request ID & Structured Logging Middleware
app.use((req, res, next) => {
  const reqId = (req.headers['x-request-id'] as string) || randomUUID();
  (req as any).id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
});

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow local development UI and Vite assets
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Public Health Checks & Root Service Info
app.get(['/', '/health', '/api/health', '/api/v1/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'devorbit-api',
    version: '0.1.0',
    time: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      live: '/api/v1/live',
      ready: '/api/v1/ready',
      auth: '/api/v1/auth',
      integrations: '/api/v1/integrations',
      opensource: '/api/v1/opensource',
      profile: '/api/v1/profile',
    },
  });
});

// Liveness probe (HTTP server alive and responsive)
app.get(['/live', '/api/live', '/api/v1/live'], (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe (Database connectivity and subsystem health)
app.get(['/ready', '/api/ready', '/api/v1/ready'], async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database unreachable' : err.message,
      timestamp: new Date().toISOString(),
    });
  }
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
v1Router.use('/profile', profileRouter);

// Support both /api/v1/... and direct /api/... mounting for maximum compatibility
app.use('/api/v1', v1Router);
app.use('/api', v1Router);

// Catch-all for undefined API routes - NEVER return HTML
app.all(['/api', '/api/*'], (req, res) => {
  const requestId = (req as any).id || null;
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
      details: null,
    },
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    requestId,
  });
});

// Global Error Handler
app.use(errorHandler);
