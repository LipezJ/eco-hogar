import { API_ENDPOINTS } from "@/lib/api-config";
import type { User as SharedUser } from "@web-project/types/users";

export type AuthUser = SharedUser;

interface AuthResponse {
  user: AuthUser | null;
  error?: string;
}

/**
 * Maneja respuestas de auth; lanza error si el status no es OK.
 * @param response Respuesta fetch.
 * @returns Objeto con user o error.
 */
async function handleResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Ocurrió un error inesperado");
  }
  return data;
}

/**
 * Inicia sesión con usuario/contraseña y captcha.
 * @param username Nombre de usuario.
 * @param password Contraseña en texto plano.
 * @param captcha Objeto con id y código ingresado.
 * @returns usuario autenticado.
 */
export async function loginRequest(
  username: string,
  password: string,
  captcha: { id: string; code: string }
): Promise<AuthUser> {
  const res = await fetch(`${API_ENDPOINTS.auth}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password, captchaId: captcha.id, captchaCode: captcha.code }),
  });

  const data = await handleResponse(res);
  if (!data.user) {
    throw new Error("No se pudo iniciar sesión");
  }
  return data.user;
}

/**
 * Registra un usuario nuevo y retorna la sesión.
 * @param name Nombre visible.
 * @param username Nombre de usuario.
 * @param email Correo.
 * @param password Contraseña.
 * @param captcha Objeto con id y código.
 * @returns usuario autenticado recién creado.
 */
export async function registerRequest(
  name: string,
  username: string,
  email: string,
  password: string,
  captcha: { id: string; code: string }
): Promise<AuthUser> {
  const res = await fetch(`${API_ENDPOINTS.auth}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, username, email, password, captchaId: captcha.id, captchaCode: captcha.code }),
  });

  const data = await handleResponse(res);
  if (!data.user) {
    throw new Error("No se pudo registrar el usuario");
  }
  return data.user;
}

/**
 * Cierra la sesión actual.
 * @throws Error si el backend responde distinto de 204/200.
 */
export async function logoutRequest(): Promise<void> {
  const res = await fetch(`${API_ENDPOINTS.auth}/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo cerrar sesión");
  }
}

/**
 * Obtiene la sesión activa (o null si no hay).
 * @returns usuario actual o null.
 */
export async function sessionRequest(): Promise<AuthUser | null> {
  const res = await fetch(`${API_ENDPOINTS.auth}/session`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json().catch(() => ({ user: null }));
  return data.user ?? null;
}
