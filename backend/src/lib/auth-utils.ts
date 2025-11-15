import type { Response } from 'express';
import jwt from 'jsonwebtoken';

export const TOKEN_COOKIE = 'auth_token';
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function createToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}
