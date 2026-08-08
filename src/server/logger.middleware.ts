/**
 * JiuSpeak AI - Observability & Cost Logging Middleware
 */

import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const path = req.path;
  const method = req.method;

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    console.log(`[JiuSpeak AI Log] ${method} ${path} - Status: ${res.statusCode} (${durationMs}ms)`);
  });

  next();
}
