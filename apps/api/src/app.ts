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

import os from 'os';

let prevCpuUsage = process.cpuUsage();
let prevCpuTime = Date.now();

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

v1Router.get('/system/status', (req, res) => {
  const mem = process.memoryUsage();
  const currentCpuUsage = process.cpuUsage(prevCpuUsage);
  const now = Date.now();
  const timeDelta = (now - prevCpuTime) * 1000; // microseconds
  const totalCpuTime = currentCpuUsage.user + currentCpuUsage.system;
  const cpuCores = Math.max(1, os.cpus().length);
  const cpuPercent = timeDelta > 0 ? Math.min(100, Math.round((totalCpuTime / (timeDelta * cpuCores)) * 1000) / 10) : 0.8;

  prevCpuUsage = process.cpuUsage();
  prevCpuTime = now;

  res.json({
    success: true,
    data: {
      cpuPercent: Math.max(0.2, cpuPercent),
      memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      memoryHeapMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      uptimeSeconds: Math.round(process.uptime()),
      dbConnected: true,
      ecoMode: true,
      platform: process.platform,
    },
  });
});

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

app.use('/api/v1', v1Router);

// Global Error Handler
app.use(errorHandler);
