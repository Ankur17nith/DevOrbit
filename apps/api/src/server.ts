import { app } from './app.js';
import { config } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`🚀 DevOrbit API server listening on http://localhost:${config.port}`);
  console.log(`📡 Health endpoint: http://localhost:${config.port}/api/health`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${config.port} is already in use by another process.`);
    console.error(`💡 To free port ${config.port}, run:`);
    console.error(`   fuser -k ${config.port}/tcp || npx kill-port ${config.port}`);
    console.error(`   Then restart with: npm run dev\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
