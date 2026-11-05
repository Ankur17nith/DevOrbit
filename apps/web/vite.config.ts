import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                data: null,
                error: {
                  message: 'DevOrbit API server is unavailable or restarting. Please ensure the backend is running on port 3001.',
                  details: err.message,
                  statusCode: 503,
                },
                message: 'API Gateway Unavailable',
              }));
            }
          });
        },
      },
    },
  },
});
