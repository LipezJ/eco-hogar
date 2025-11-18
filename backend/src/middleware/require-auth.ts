/**
 * Middleware que valida la cookie JWT y adjunta el usuario autenticado a la request.
 */
import type { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';
import { TOKEN_COOKIE, clearAuthCookie, verifyToken } from '../lib/auth-utils.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: typeof users.$inferSelect;
    }
  }
}

/**
 * Valida la cookie JWT y adjunta el usuario autenticado.
 * @returns Envía 401 si no hay sesión válida; llama next() si es correcto.
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const payload = verifyToken(token);
    // Buscamos el usuario de la cookie; si no existe, limpiamos sesión.
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) {
      clearAuthCookie(res);
      res.status(401).json({ error: 'Sesion invalida' });
      return;
    }

    req.authUser = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    clearAuthCookie(res);
    res.status(401).json({ error: 'Sesion invalida' });
  }
};
