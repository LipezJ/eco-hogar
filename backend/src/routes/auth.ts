/**
 * Auth API routes.
 * @route POST /api/auth/register
 * @route POST /api/auth/login
 * @route GET /api/auth/session
 * @route POST /api/auth/logout
 * @route GET /api/auth/captcha
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import svgCaptcha from 'svg-captcha';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { TOKEN_COOKIE, clearAuthCookie, createToken, setAuthCookie, verifyToken } from '../lib/auth-utils.js';

const router = Router();

/** Esquema para validar los campos del registro. */
const registerSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ingresar un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  captchaId: z.string(),
  captchaCode: z.string(),
});

/** Esquema para validar la solicitud de login. */
const loginSchema = z.object({
  username: z.string().min(3, 'Usuario inválido'),
  password: z.string().min(6, 'Contraseña inválida'),
  captchaId: z.string(),
  captchaCode: z.string(),
});

/**
 * Elimina el hash de contraseña antes de devolver el usuario al cliente.
 * @param user Usuario completo desde la base de datos.
 * @returns Usuario sin el campo passwordHash.
 */
export function sanitizeUser(user: typeof users.$inferSelect) {
  const { passwordHash, ...rest } = user;
  return rest;
}

/**
 * Busca un usuario por nombre de usuario.
 * @param username Nombre de usuario.
 */
async function findUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user;
}

/**
 * Busca un usuario por email.
 * @param email Correo electrónico.
 */
async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

/**
 * Busca un usuario por ID.
 * @param id Identificador interno.
 */
async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

/**
 * Crea un administrador por defecto si no existe.
 * Solo se ejecuta al levantar el servidor.
 */
async function ensureDefaultAdmin() {
  const defaultUsername = 'admin';
  const defaultEmail = 'admin@example.com';
  const defaultPassword = 'admin1234';
  const defaultName = 'Administrador';

  const existing = await findUserByUsername(defaultUsername);
  const existingEmail = await findUserByEmail(defaultEmail);
  if (existing || existingEmail) {
    return;
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await db.insert(users).values({
    id: randomUUID(),
    username: defaultUsername,
    email: defaultEmail,
    name: defaultName,
    passwordHash,
    createdAt: new Date(),
  });

  console.log('✅ Usuario administrador por defecto creado (admin/admin1234)');
}

void ensureDefaultAdmin().catch((error) => {
  console.error('Error creating default admin user:', error);
});

// Captcha store en memoria
const captchaStore = new Map<string, { text: string; expires: number }>();
const CAPTCHA_TTL_MS = 5 * 60 * 1000;

/**
 * Genera el captcha en SVG y texto.
 * @returns Contenido SVG y texto plano.
 */
function createCaptcha() {
  const { data, text } = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: '#f8fafc',
    ignoreChars: '0Oo1Il',
  });
  return { svg: data, text };
}

/**
 * Guarda el captcha en memoria con TTL.
 * @param id Identificador entregado al cliente.
 * @param text Valor de validación.
 */
function saveCaptcha(id: string, text: string) {
  captchaStore.set(id, { text, expires: Date.now() + CAPTCHA_TTL_MS });
}

/**
 * Verifica si el captcha enviado es válido.
 * @param id Identificador entregado al cliente.
 * @param code Código ingresado.
 * @returns true si válido, false si inválido o expirado.
 */
function validateCaptcha(id: string, code: string): boolean {
  const entry = captchaStore.get(id);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    captchaStore.delete(id);
    return false;
  }
  const isValid = entry.text.toLowerCase() === code.toLowerCase();
  captchaStore.delete(id);
  return isValid;
}

/** Obtiene un captcha fresco para el formulario de autenticación. */
router.get('/captcha', (_req, res) => {
  const { svg, text } = createCaptcha();
  const id = randomUUID();
  saveCaptcha(id, text);
  res.json({ id, svg });
});

/** Registrar un nuevo usuario validando captcha y credenciales. */
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
    }

    const { username, email, password, name, captchaId, captchaCode } = parsed.data;

    if (!validateCaptcha(captchaId, captchaCode)) {
      return res.status(400).json({ error: 'Captcha inválido o expirado' });
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: randomUUID(),
      username,
      email,
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

/** Iniciar sesión con captcha y credenciales. */
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Credenciales inválidas' });
    }

    const { username, password, captchaId, captchaCode } = parsed.data;

    if (!validateCaptcha(captchaId, captchaCode)) {
      return res.status(400).json({ error: 'Captcha inválido o expirado' });
    }

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

/** Obtener sesión actual usando la cookie de auth. */
router.get('/session', async (req, res) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) {
      return res.json({ user: null });
    }

    const payload = verifyToken(token);
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

/** Terminar sesión y limpiar cookie. */
router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).send();
});

export default router;
