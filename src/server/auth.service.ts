/**
 * JiuSpeak AI - Secure Authentication Service
 * Manages user credentials, token generation, validation, and session contexts
 */

export interface AuthUser {
  id: string;
  studentId: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
}

export class AuthenticationService {
  private static activeTokens: Map<string, AuthUser> = new Map();

  static initialize() {
    // Seed default authenticated session token for Carlos "Grip"
    const defaultToken = 'jiuspeak-sec-tok-carlos-123';
    this.activeTokens.set(defaultToken, {
      id: 'usr-carlos-123',
      studentId: 'std-carlos-123',
      email: 'carlos.bjj@jiuspeak.com',
      name: 'Carlos "Grip" Silva',
      role: 'STUDENT',
    });
  }

  static validateToken(token: string): AuthUser | null {
    if (!token) return null;
    return this.activeTokens.get(token) || null;
  }

  static authenticateUser(email: string): { token: string; user: AuthUser } {
    // In production, verify password hash against database
    const user: AuthUser = {
      id: 'usr-carlos-123',
      studentId: 'std-carlos-123',
      email: email || 'carlos.bjj@jiuspeak.com',
      name: 'Carlos "Grip" Silva',
      role: 'STUDENT',
    };

    const token = `jiuspeak-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.activeTokens.set(token, user);
    return { token, user };
  }
}

AuthenticationService.initialize();
