'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { useActionState, useEffect } from "react"
import { login } from "@/lib/actions/auth-actions"
import { ArrowRightIcon, AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { useTopLoader } from "nextjs-toploader";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const loader = useTopLoader()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [state, formAction, isPending] = useActionState(
    login,
    undefined,
  );

  useEffect(() => {
    if (isPending) {
      loader.start()
    } else {
      loader.done()
    }
  }, [ isPending, loader ])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form action={formAction} className="p-6 md:p-8 pb-8 md:pb-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bienvenido</h1>
                <p className="text-muted-foreground text-balance">
                  Inicia sesión en tu cuenta
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input id="password" name="password" minLength={6} type="password" placeholder="Contraseña" required />
              </div>
              <input type="hidden" name="redirectTo" value={callbackUrl} />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'} <ArrowRightIcon className="ml-auto h-5 w-5" />
              </Button>
              {state?.error && (
                <div className="flex gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-500">{state.error}</p>
                </div>
              )}

              <div className="text-center text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                  Regístrate
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
