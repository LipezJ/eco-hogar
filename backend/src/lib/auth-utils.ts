/**
 * Utilidades para manejo de JWT y cookies de autenticación.
 */
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

export const TOKEN_COOKIE = 'auth_token';
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Crea un JWT firmado para un usuario.
 * @param userId Identificador del usuario.
 * @returns Token JWT firmado.
 */
export function createToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Escribe la cookie de autenticación en la respuesta.
 * @param res Respuesta de Express.
 * @param token JWT válido.
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
  });
}

/**
 * Limpia la cookie de autenticación.
 */
export function clearAuthCookie(res: Response) {
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Verifica y decodifica un JWT.
 * @param token Token JWT.
 * @returns Payload con sub (userId).
 * @throws jwt.JsonWebTokenError cuando el token es inválido.
 */
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}
