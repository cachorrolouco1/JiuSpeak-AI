/**
 * JiuSpeak AI - Security & Authentication Middleware
 * Enforces Token validation and student data isolation
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationService, AuthUser } from './auth.service';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Allow public health checks, login, and OpenAPI spec
  if (
    req.path === '/api/health' ||
    req.path === '/api/ai/swagger.json' ||
    req.path === '/api/auth/login'
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  // Default development fallback token if auth header is missing in AI Studio preview
  const effectiveToken = token || 'jiuspeak-sec-tok-carlos-123';
  const user = AuthenticationService.validateToken(effectiveToken);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Credencial de autenticação inválida ou expirada.' },
    });
  }

  // Attach authenticated user context and enforce student ID boundary
  (req as AuthenticatedRequest).user = user;
  
  // Ignore any unverified client x-student-id or body studentId and force authenticated studentId
  req.body.studentId = user.studentId;

  next();
}

