"use client"

import { CreditCard, FileText, Home, Receipt } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import NextTopLoader from "nextjs-toploader"

const items = [
  {
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      }
    ]
  },
  {
    name: "Administrar",
    items: [
      {
        title: "Movimientos",
        url: "/dashboard/movements",
        icon: FileText,
      },
      {
        title: "Deudas",
        url: "/dashboard/debts",
        icon: CreditCard,
      },
      {
        title: "Recibos",
        url: "/dashboard/bills",
        icon: Receipt,
      }
    ]
  }
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
      <AppSidebar sidebar={items} />
      <main className="flex-1 overflow-y-auto w-full h-full">
        {children}
      </main>
    </SidebarProvider>
  )
}