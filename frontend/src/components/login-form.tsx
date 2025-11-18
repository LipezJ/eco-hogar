'use client';

import { useEffect, useState, type ComponentProps } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from '@/lib/router';
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api-config";

interface CaptchaState {
  id: string;
  svg: string;
}

/** Formulario de login con captcha y navegación al dashboard. */
export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const loadCaptcha = async () => {
    setCaptchaError(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.auth}/captcha`, { credentials: "include" });
      const data = await res.json();
      setCaptcha({ id: data.id, svg: data.svg });
      setCaptchaCode("");
    } catch {
      setCaptcha(null);
      setCaptchaError("No se pudo cargar el captcha. Intente nuevamente.");
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      router.navigate('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!username || !password) {
      setError('Debes ingresar tu usuario y contraseña');
      return;
    }

    if (!captcha || !captchaCode.trim()) {
      setError('Resuelve el captcha antes de continuar');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username, password, captchaId: captcha.id, captchaCode });
      router.navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
      void loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8 pb-8 md:pb-10" onSubmit={handleSubmit}>
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
                  disabled={isSubmitting || isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  minLength={6}
                  type="password"
                  placeholder="Contraseña"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label>Captcha</Label>
                <div className="flex items-center gap-3">
                  {captcha?.svg ? (
                    <div
                      className="border rounded-md p-2 bg-muted"
                      dangerouslySetInnerHTML={{ __html: captcha.svg }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={loadCaptcha} disabled={isSubmitting}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="captcha"
                  name="captcha"
                  value={captchaCode}
                  onChange={(e) => setCaptchaCode(e.target.value)}
                  placeholder="Ingrese el texto de la imagen"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>

              {(error || captchaError) && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{captchaError ?? error}</span>
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
  );
}
