"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CreditCard,
  FileText,
  Landmark,
  Menu,
  PiggyBank,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Zap
} from "lucide-react"
import { useState } from "react"

export default function LandingPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center">
            {/* Logo */}
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="font-bold text-lg md:text-xl">EcoHogar</span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Características
              </a>
              <a
                href="#benefits"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Beneficios
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Precios
              </a>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Registrate
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu */}
              <div className="flex lg:hidden items-center gap-2">
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Iniciar sesión
                  </Button>
                </Link>

                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col gap-6 pt-6">
                      {/* Logo in Mobile Menu */}
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <PiggyBank className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg">EcoHogar</span>
                      </div>

                      {/* Mobile Navigation Links */}
                      <nav className="flex flex-col gap-4">
                        <a
                          href="#features"
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                        >
                          Características
                        </a>
                        <a
                          href="#benefits"
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                        >
                          Beneficios
                        </a>
                        <a
                          href="#pricing"
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                        >
                          Precios
                        </a>
                      </nav>

                      {/* Mobile CTA Buttons */}
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        <Link href="/login" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Iniciar sesión
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setOpen(false)}>
                          <Button className="w-full">
                            Registrate
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-background to-background"></div>
          <div className="absolute inset-0 -z-10 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-size-[20px_20px]"></div>

          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                <Zap className="mr-1 h-3 w-3" />
                Nueva versión disponible
              </div>

              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text">
                  Gestiona tus finanzas personales con{" "}
                  <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    inteligencia
                  </span>
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  EcoHogar te ayuda a tomar el control total de tu dinero.
                  Organiza tus ingresos, gastos, deudas e inversiones en un solo lugar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <Link href="/register">
                  <Button size="lg">
                    Comenzar gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="pt-12 w-full max-w-6xl">
                <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

                  <div className="relative aspect-video bg-linear-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center">
                    <img className="absolute inset-0 w-full" src="/img/dashboard.png" alt="Dashboard" />
                    <div className="text-center space-y-6 p-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                        <BarChart3 className="relative h-24 w-24 mx-auto text-primary" />
                      </div>
                      <div className="relative space-y-2 z-10">
                        <p className="text-lg font-semibold">Dashboard de EcoHogar</p>
                        <p className="text-sm text-muted-foreground">Visualiza tus finanzas en tiempo real</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 md:gap-16 pt-12 w-full max-w-2xl">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">1000+</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-center">Usuarios activos</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">$2M+</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-center">Gestionados</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-3xl md:text-4xl font-bold text-primary">99%</p>
                  <p className="text-xs md:text-sm text-muted-foreground text-center">Satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-background">
                ✨ Características
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Todo lo que necesitas para gestionar tu dinero
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Herramientas completas para el control total de tus finanzas personales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <TrendingUp className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Movimientos</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Registra y categoriza todos tus ingresos y gastos.
                        Visualiza tu flujo de caja con reportes detallados y gráficos interactivos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Cuentas Bancarias</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Gestiona múltiples cuentas en diferentes bancos y monedas.
                        Monitorea tus saldos y realiza un seguimiento completo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <CreditCard className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Deudas y Préstamos</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Controla tus deudas con sistema de amortización automático.
                        Visualiza cuotas, intereses y proyecciones de pago.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Recibos y Servicios</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Organiza todos tus servicios y recibos.
                        Recibe alertas de vencimiento y nunca olvides un pago.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <Landmark className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">CDTs e Inversiones</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Rastrea tus inversiones a plazo fijo.
                        Calcula intereses compuestos y visualiza el rendimiento de tu dinero.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Reportes y Analytics</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Obtén insights profundos con dashboards interactivos.
                        Toma decisiones informadas sobre tu dinero.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold">
                ¿Por qué elegir EcoHogar?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                La plataforma más completa para tus finanzas personales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Rápido y fácil</h3>
                <p className="text-muted-foreground">
                  Interfaz intuitiva que te permite gestionar todo en minutos
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">100% Seguro</h3>
                <p className="text-muted-foreground">
                  Tus datos están protegidos con los más altos estándares de seguridad
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Multi-dispositivo</h3>
                <p className="text-muted-foreground">
                  Accede desde cualquier dispositivo, en cualquier momento
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Soporte dedicado</h3>
                <p className="text-muted-foreground">
                  Equipo de soporte listo para ayudarte cuando lo necesites
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold">
                Planes para cada necesidad
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comienza gratis y escala cuando lo necesites
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Plan Básico */}
              <Card className="flex flex-col">
                <CardContent className="pt-6 flex flex-col flex-1">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold">Básico</h3>
                      <p className="text-muted-foreground mt-2">
                        Perfecto para comenzar
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">Gratis</div>
                      <p className="text-sm text-muted-foreground">Para siempre</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Hasta 50 movimientos/mes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>2 cuentas bancarias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Reportes básicos</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link href="/register" className="block">
                      <Button variant="outline" className="w-full">
                        Comenzar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Pro */}
              <Card className="border-primary shadow-lg flex flex-col relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-block px-4 py-1.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                    MÁS POPULAR
                  </div>
                </div>
                <CardContent className="pt-6 flex flex-col flex-1">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold">Pro</h3>
                      <p className="text-muted-foreground mt-2">
                        Para usuarios avanzados
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">$9.99</div>
                      <p className="text-sm text-muted-foreground">por mes</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Movimientos ilimitados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Cuentas ilimitadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Reportes avanzados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Soporte prioritario</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link href="/register" className="block">
                      <Button className="w-full">
                        Comenzar ahora
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Empresa */}
              <Card className="flex flex-col">
                <CardContent className="pt-6 flex flex-col flex-1">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold">Empresa</h3>
                      <p className="text-muted-foreground mt-2">
                        Para equipos y familias
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">$24.99</div>
                      <p className="text-sm text-muted-foreground">por mes</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Todo de Pro</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Hasta 5 usuarios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>API de integración</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>Soporte 24/7</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link href="/register" className="block">
                      <Button variant="outline" className="w-full">
                        Contactar ventas
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 md:p-12">
                <div className="text-center space-y-6 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    ¿Listo para tomar el control de tus finanzas?
                  </h2>
                  <p className="text-lg text-primary-foreground/90">
                    Únete a miles de usuarios que ya están mejorando su salud financiera con EcoHogar
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <Button size="lg" variant="secondary">
                        Comenzar gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">EcoHogar</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma completa para gestionar tus finanzas personales de forma inteligente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guías</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 EcoHogar. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
