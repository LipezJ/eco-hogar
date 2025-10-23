"use client"

import { SiteHeader } from "@/components/site-header";
import { MovementsStats } from "@/components/stats/movements";
import { MovementsReports } from "@/components/reports/movements-reports";
import { DebtsStats } from "@/components/stats/debts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Movement } from "@/types/movements";
import { Debt, Payment, generateAmortizationTable } from "@/types/debts";
import { Wallet, CreditCard } from "lucide-react";

// Datos de ejemplo para la UI
const mockMovements: Movement[] = [
  {
    id: "1",
    type: "egreso",
    category: "comida",
    amount: 45000,
    description: "Compra en supermercado",
    tags: ["supermercado", "mensual"],
    date: "2025-10-20",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    type: "ingreso",
    category: "otros",
    amount: 500000,
    description: "Salario mensual",
    tags: ["salario"],
    date: "2025-10-15",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    type: "egreso",
    category: "transporte",
    amount: 25000,
    description: "Recarga transporte público",
    tags: ["transporte"],
    date: "2025-10-18",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    type: "egreso",
    category: "servicios",
    amount: 80000,
    description: "Pago de internet",
    tags: ["servicios", "mensual"],
    date: "2025-10-10",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    type: "egreso",
    category: "ocio",
    amount: 35000,
    description: "Cine con amigos",
    tags: ["entretenimiento"],
    attachment: "https://example.com/ticket.pdf",
    date: "2025-10-19",
    createdAt: new Date().toISOString()
  }
]

// Datos de ejemplo de deudas
const mockDebts: Debt[] = [
  {
    id: "1",
    type: "deuda",
    origin: "Banco Nacional",
    amount: 5000000,
    interestRate: 12.5,
    installments: 24,
    startDate: "2025-09-01",
    paymentDay: 15,
    description: "Préstamo personal",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    type: "prestamo",
    origin: "Juan Pérez",
    amount: 1000000,
    interestRate: 5,
    installments: 12,
    startDate: "2025-08-15",
    paymentDay: 20,
    description: "Préstamo a amigo",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    type: "deuda",
    origin: "Tarjeta de Crédito",
    amount: 800000,
    interestRate: 18,
    installments: 12,
    startDate: "2025-10-01",
    paymentDay: 5,
    description: "Pago diferido",
    createdAt: new Date().toISOString()
  }
]

// Generar pagos para las deudas de ejemplo
const mockPayments: Payment[] = mockDebts.flatMap(debt => {
  const allPayments = generateAmortizationTable(debt)
  // Marcar algunos pagos como pagados
  return allPayments.map((payment, index) => {
    if (debt.id === "1" && index < 3) {
      return { ...payment, isPaid: true, paidDate: new Date(payment.dueDate).toISOString() }
    }
    if (debt.id === "2" && index < 2) {
      return { ...payment, isPaid: true, paidDate: new Date(payment.dueDate).toISOString() }
    }
    return payment
  })
})

export default function Home() {
  // const { data: movements } = useQuery<Movement[]>({
  //   queryKey: ['movements'],
  //   queryFn: () => {
  //     return fetch('/api/movements').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Dashboard" />
      <section className="container mx-auto pt-4 px-4">
        <Tabs defaultValue="movements" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="debts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Deudas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="movements" className="my-4 space-y-4">
            <MovementsStats movements={mockMovements} />
            <MovementsReports movements={mockMovements} />
          </TabsContent>
          <TabsContent value="debts" className="my-4">
            <DebtsStats debts={mockDebts} payments={mockPayments} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
  