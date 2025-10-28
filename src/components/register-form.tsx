'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { register } from "@/lib/actions/auth-actions"
import { ArrowRightIcon, AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { useTopLoader } from "nextjs-toploader";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const loader = useTopLoader()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [state, formAction, isPending] = useActionState(
    register,
    undefined,
  );
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    if (isPending) {
      loader.start()
    } else {
      loader.done()
    }
  }, [ isPending, loader ])

  const handleSubmit = (formData: FormData) => {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setPasswordError('');
    formAction(formData);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form action={handleSubmit} className="p-6 md:p-8 pb-8 md:pb-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Crear cuenta</h1>
                <p className="text-muted-foreground text-balance">
                  Comienza a gestionar tus finanzas con EcoHogar
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  minLength={2}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nombre de usuario"
                  minLength={3}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  minLength={6}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  minLength={6}
                  type="password"
                  placeholder="Confirma tu contraseña"
                  required
                  disabled={isPending}
                />
              </div>

              <input type="hidden" name="redirectTo" value={callbackUrl} />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creando cuenta...' : 'Crear cuenta'} <ArrowRightIcon className="ml-auto h-5 w-5" />
              </Button>

              {(state?.error || passwordError) && (
                <div className="flex gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-500">{passwordError || state?.error}</p>
                </div>
              )}

              <div className="text-center text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  Inicia sesión
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Al crear una cuenta, aceptas nuestros{" "}
        <a href="#">Términos de Servicio</a> y{" "}
        <a href="#">Política de Privacidad</a>.
      </div>
    </div>
  )
}
