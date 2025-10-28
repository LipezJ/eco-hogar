"use server"

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCredentials, registerUser, initializeDefaultUsers } from '@/lib/auth';
import { SignJWT, jwtVerify } from 'jose';
import { checkBotId } from 'botid/server';

// Inicializar usuarios por defecto al cargar el módulo
initializeDefaultUsers();

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'secret'
);

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 días en segundos

export async function createSession(userId: string, username: string, name: string) {
  const token = await new SignJWT({ userId, username, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function login(_prevState: { error: string } | undefined, formData: FormData) {
  // Verificar Bot Protection
  const { isBot } = await checkBotId();

  if (isBot) {
    return { error: 'Verificación de seguridad fallida. Por favor, intenta nuevamente.' };
  }

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/dashboard';

  if (!username || !password) {
    return { error: 'Por favor, completa todos los campos' };
  }

  const user = await verifyCredentials(username, password);

  if (!user) {
    return { error: 'Credenciales inválidas' };
  }

  await createSession(user.id, user.username, user.name);
  redirect(redirectTo);
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function register(_prevState: { error?: string } | undefined, formData: FormData) {
  // Verificar Bot Protection
  const { isBot } = await checkBotId();

  if (isBot) {
    return { error: 'Verificación de seguridad fallida. Por favor, intenta nuevamente.' };
  }

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const redirectTo = formData.get('redirectTo') as string || '/dashboard';

  // Validaciones básicas
  if (!username || !password || !name) {
    return { error: 'Por favor, completa todos los campos' };
  }

  // Intentar registrar el usuario
  const result = await registerUser(username, password, name);

  if (!result.success) {
    return { error: result.error };
  }

  // Si el registro fue exitoso, crear sesión automáticamente
  if (result.user) {
    await createSession(result.user.id, result.user.username, result.user.name);
    redirect(redirectTo);
  }

  return { error: 'Error al crear la cuenta' };
}
