import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const router = Router();

const TOKEN_COOKIE = 'auth_token';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const registerSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

const loginSchema = z.object({
  username: z.string().min(3, 'Usuario inválido'),
  password: z.string().min(6, 'Contraseña inválida'),
});

function sanitizeUser(user: typeof users.$inferSelect) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function setAuthCookie(res: import('express').Response, token: string) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
  });
}

function clearAuthCookie(res: import('express').Response) {
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function createToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function findUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user;
}

async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

async function ensureDefaultAdmin() {
  const defaultUsername = 'admin';
  const defaultPassword = 'admin1234';
  const defaultName = 'Administrador';

  const existing = await findUserByUsername(defaultUsername);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await db.insert(users).values({
    id: randomUUID(),
    username: defaultUsername,
    name: defaultName,
    passwordHash,
    createdAt: new Date(),
  });

  console.log('✅ Usuario administrador por defecto creado (admin/admin1234)');
}

void ensureDefaultAdmin().catch((error) => {
  console.error('Error creating default admin user:', error);
});

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
    }

    const { username, password, name } = parsed.data;

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: randomUUID(),
      username,
      name,
      passwordHash,
      createdAt: new Date(),
    };

    await db.insert(users).values(newUser);

    const token = createToken(newUser.id);
    setAuthCookie(res, token);

    return res.status(201).json({ user: sanitizeUser(newUser) });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Credenciales inválidas' });
    }

    const { username, password } = parsed.data;
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = createToken(user.id);
    setAuthCookie(res, token);

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/session', async (req, res) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) {
      return res.json({ user: null });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await findUserById(payload.sub);

    if (!user) {
      clearAuthCookie(res);
      return res.json({ user: null });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error validating session:', error);
    clearAuthCookie(res);
    return res.json({ user: null });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).send();
});

export default router;
