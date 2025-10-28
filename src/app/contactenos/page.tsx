"use client"

import { useState } from "react"
import { Mail, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MarketingHeader } from "@/components/layout/marketing-header"

type MemberId = "anderson" | "juan" | "david" | "rances"

const MEMBERS: Array<{
  id: MemberId
  name: string
  role: string
  code: string
  email: string
  photo: string
}> = [
  {
    id: "anderson",
    name: "ANDERSON NICOLAS DÍAZ CAMACHO",
    role: "Líder del Grupo",
    code: "2214105",
    email: "",
    photo: "/img/team-anderson.svg",
  },
  {
    id: "juan",
    name: "JUAN DAVID LIPEZ GUEVARA",
    role: "Estudiante",
    code: "2223102",
    email: "",
    photo: "/img/team-juan.svg",
  },
  {
    id: "david",
    name: "DAVID FERNANDO MUÑOZ ORTIZ",
    role: "Estudiante",
    code: "2234504",
    email: "",
    photo: "/img/team-david.svg",
  },
  {
    id: "rances",
    name: "RANCES ALEJANDRO RAMÍREZ MORILLO",
    role: "Estudiante",
    code: "2234514",
    email: "",
    photo: "/img/team-rances.svg",
  },
]

export default function ContactoPage() {
  const [open, setOpen] = useState<MemberId | null>(null)
  const active = MEMBERS.find(m => m.id === open) || null

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />

      <main className="flex-1">
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-background">
                <Users className="h-4 w-4 mr-2" /> Equipo y Contacto
              </div>
              <h1 className="text-3xl md:text-5xl font-bold">Estamos para ayudarte</h1>
              <p className="text-muted-foreground md:text-lg">Escríbenos o conoce a nuestro equipo de desarrollo</p>
            </div>

            {/* Datos de contacto rápidos */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Correo</p>
                    <a className="text-sm text-muted-foreground underline" href="mailto:hola@ecohogar.app">hola@ecohogar.app</a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="font-semibold mb-1">Soporte</p>
                  <p className="text-sm text-muted-foreground">Envíanos tus preguntas y sugerencias. Respondemos en 24-48h.</p>
                </CardContent>
              </Card>
            </div>

            {/* Miembros del equipo */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Miembros del equipo</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {MEMBERS.map((m) => (
                  <Card key={m.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        <img src={m.photo} alt={m.name} className="h-16 w-16 rounded-lg object-cover border" />
                        <div className="flex-1">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-muted-foreground">{m.role}</p>
                        </div>
                        <Button variant="outline" onClick={() => setOpen(m.id)}>Ver detalles</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de miembro */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.name}</DialogTitle>
                <DialogDescription>{active.role}</DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-4">
                <img src={active.photo} alt={active.name} className="h-20 w-20 rounded-lg object-cover border" />
                <div className="text-sm">
                  <p className="mb-1"><span className="text-muted-foreground">Nombre:</span> {active.name}</p>
                  <p className="mb-1"><span className="text-muted-foreground">Rol:</span> {active.role}</p>
                  <p className="mb-1"><span className="text-muted-foreground">Código:</span> {active.code}</p>
                  {active.email && (
                    <p className="mb-1"><span className="text-muted-foreground">Email:</span> <a className="underline" href={`mailto:${active.email}`}>{active.email}</a></p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
