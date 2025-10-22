"use client"

import { FileText } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import NextTopLoader from "nextjs-toploader"

const items = [
  {
    title: "Movimientos",
    url: "/dashboard/movements",
    icon: FileText,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <NextTopLoader color="var(--primary)" />
      <AppSidebar title="Administrar" items={items} />
      <main className="flex-1 overflow-y-auto w-full h-full">
        {children}
      </main>
    </SidebarProvider>
  )
}