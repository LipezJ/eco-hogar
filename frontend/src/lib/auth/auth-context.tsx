import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "./auth";
import { loginRequest, logoutRequest, registerRequest, sessionRequest } from "./auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; captchaId: string; captchaCode: string }) => Promise<void>;
  register: (payload: { name: string; username: string; email: string; password: string; captchaId: string; captchaCode: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de estado de autenticación (usuario y loader).
 */
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionUser = await sessionRequest();
        setUser(sessionUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, []);

  const login = useCallback(async ({ username, password, captchaId, captchaCode }: { username: string; password: string; captchaId: string; captchaCode: string }) => {
    const loggedUser = await loginRequest(username, password, { id: captchaId, code: captchaCode });
    setUser(loggedUser);
  }, []);

  const register = useCallback(async ({ name, username, email, password, captchaId, captchaCode }: { name: string; username: string; email: string; password: string; captchaId: string; captchaCode: string }) => {
    const newUser = await registerRequest(name, username, email, password, { id: captchaId, code: captchaCode });
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para consumir el contexto de autenticación. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
