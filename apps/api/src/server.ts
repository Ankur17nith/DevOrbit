import { app } from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  console.log(`🚀 DevOrbit API server listening on http://localhost:${config.port}`);
  console.log(`📡 Health endpoint: http://localhost:${config.port}/api/health`);
});
