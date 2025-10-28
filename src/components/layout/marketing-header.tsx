/* eslint-disable @next/next/no-html-link-for-pages */
"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PiggyBank, Menu } from "lucide-react"

export function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
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
    <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Características</a>
    <a href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
    <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Precios</a>
    <a href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Preguntas frecuentes</a>
    <Link href="/contactenos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contáctenos</Link>
  </nav>

          {/* Desktop CTA Buttons */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrate</Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="flex lg:hidden items-center gap-2">
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm" className="text-xs">Iniciar sesión</Button>
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
                      <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">Características</a>
                      <a href="#benefits" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">Beneficios</a>
                      <a href="#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">Precios</a>
                      <a href="#faq" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">Preguntas frecuentes</a>
                      <Link href="/contactenos" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">Contáctenos</Link>
                    </nav>

                    <div className="flex flex-col gap-3">
                      <Link href="/register" className="block" onClick={() => setOpen(false)}>
                        <Button className="w-full">Comenzar gratis</Button>
                      </Link>
                      <Link href="/login" className="block" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">Iniciar sesión</Button>
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
  )
}
