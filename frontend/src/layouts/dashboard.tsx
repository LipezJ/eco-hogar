import { Bell, CreditCard, FileText, Home, Landmark, PiggyBank, Receipt, Settings } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
// import NextTopLoader from "nextjs-toploader"

const items = [
  {
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Notificaciones",
        url: "/dashboard/notifications",
        icon: Bell,
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
      },
      {
        title: "CDTs",
        url: "/dashboard/cdts",
        icon: PiggyBank,
      },
      {
        title: "Cuentas",
        url: "/dashboard/accounts",
        icon: Landmark,
      }
    ]
  },
  {
    name: "Configuraciones",
    items: [
      {
        title: "Presupuesto mensual",
        url: "/dashboard/settings",
        icon: Settings,
      }
    ]
  }
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* <NextTopLoader color="var(--primary)" /> */}
      <AppSidebar sidebar={items} />
      <main className="flex-1 overflow-y-auto w-full h-full">
        {children}
      </main>
    </SidebarProvider>
  )
}
