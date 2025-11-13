import { type ReactNode } from "react"
import { AuthContextProvider } from "@/lib/auth/auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}
