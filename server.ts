/**
 * JiuSpeak AI - Express Backend Server Entry Point
 * Host: 0.0.0.0, Port: from .env (default 3001)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { authMiddleware } from './src/server/auth.middleware';
import { rateLimitMiddleware } from './src/server/rate-limit.middleware';
import { loggerMiddleware } from './src/server/logger.middleware';
import apiRoutes from './src/server/routes';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3001');

  // Global Middlewares
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(loggerMiddleware);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'JiuSpeak AI by JiuSpeak',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Gateway
  app.use('/api/ai', authMiddleware, rateLimitMiddleware, apiRoutes);

  // Vite Development Middleware vs Static Production Fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🥋 JiuSpeak AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting JiuSpeak AI Server:', err);
});
