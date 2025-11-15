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

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const payload = verifyToken(token);
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    req.authUser = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Sesión inválida' });
  }
};
