import { type ReactNode } from "react"
import { AuthContextProvider } from "@/lib/auth/auth-context"

/**
 * Wrapper que provee el contexto de autenticación a la app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}
