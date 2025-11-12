/* eslint-disable @typescript-eslint/no-unused-vars */
// Configuración de autenticación con almacenamiento en memoria

import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  name: string;
}

interface UserWithPassword extends User {
  password: string;
}

// Almacenamiento en memoria de usuarios
const USERS_STORE: UserWithPassword[] = [];

// Función para inicializar usuarios por defecto (se ejecuta al arrancar)
export async function initializeDefaultUsers() {
  if (USERS_STORE.length === 0) {
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrador'
      },
      {
        id: '2',
        username: 'usuario',
        password: await bcrypt.hash('usuario123', 10),
        name: 'Usuario'
      }
    ];
    USERS_STORE.push(...defaultUsers);
  }
}

// Verificar credenciales con bcrypt
export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  const user = USERS_STORE.find(u => u.username === username);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  // Retornamos el usuario sin la contraseña
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Registrar un nuevo usuario
export async function registerUser(username: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: User }> {
  // Verificar si el usuario ya existe
  const existingUser = USERS_STORE.find(u => u.username === username);

  if (existingUser) {
    return { success: false, error: 'El nombre de usuario ya está en uso' };
  }

  // Validaciones básicas
  if (!username || username.length < 3) {
    return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  if (!name || name.length < 2) {
    return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  // Crear nuevo usuario
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: UserWithPassword = {
    id: Date.now().toString(), // ID simple basado en timestamp
    username,
    password: hashedPassword,
    name
  };

  USERS_STORE.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
}

// Obtener todos los usuarios (sin contraseñas)
export function getUsers(): User[] {
  return USERS_STORE.map(({ password, ...user }) => user);
}

// Obtener usuario por ID
export function getUserById(id: string): User | null {
  const user = USERS_STORE.find(u => u.id === id);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
