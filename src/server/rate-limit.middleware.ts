/**
 * JiuSpeak AI - Advanced Rate Limiting & Cost Safety Middleware
 * Differentiates limits by endpoint operation type (Chat vs Speech-To-Text vs Text-To-Speech)
 */

import { Request, Response, NextFunction } from 'express';

interface RateRecord {
  count: number;
  resetAt: number;
}

const rateStore: Map<string, RateRecord> = new Map();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const userKey = (req as any).user?.studentId || req.ip || 'anonymous';
  const operationType = req.path.includes('/voice/stt')
    ? 'stt'
    : req.path.includes('/voice/tts')
    ? 'tts'
    : 'chat';

  const limit = operationType === 'stt' ? 30 : operationType === 'tts' ? 50 : 100;
  const windowMs = 60 * 1000; // 1 minute window
  const now = Date.now();

  const key = `${userKey}:${operationType}`;
  let record = rateStore.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    rateStore.set(key, record);
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Limite de requisições excedido para a operação (${operationType.toUpperCase()}). Aguarde ${retryAfter} segundos.`,
      },
    });
  }

  record.count += 1;
  next();
}
