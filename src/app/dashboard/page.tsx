"use client"

import { SiteHeader } from "@/components/site-header";
import { MovementsStats } from "@/components/stats/movements";
import { MovementsReports } from "@/components/reports/movements-reports";
import { DebtsStats } from "@/components/stats/debts";
import { BillsStats } from "@/components/stats/bills";
import { BillsReports } from "@/components/reports/bills-reports";
import { CdtsStats } from "@/components/stats/cdts";
import { CdtsReports } from "@/components/reports/cdts-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Movement } from "@/types/movements";
import { Debt, Payment, generateAmortizationTable } from "@/types/debts";
import { Bill } from "@/types/bills";
import { Cdt, calculateDueDate, calculateFinalAmount } from "@/types/cdts";
import { Wallet, CreditCard, FileText, PiggyBank } from "lucide-react";

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

// Datos de ejemplo de recibos
const mockBills: Bill[] = [
  {
    id: "1",
    provider: "Edenor",
    category: "electricidad",
    cycle: "bimestral",
    amount: 45000,
    dueDate: "2025-10-25",
    status: "pendiente",
    autoRenew: true,
    description: "Servicio eléctrico residencial",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    provider: "Aysa",
    category: "agua",
    cycle: "mensual",
    amount: 12000,
    dueDate: "2025-10-28",
    status: "pendiente",
    autoRenew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    provider: "Telecom",
    category: "internet",
    cycle: "mensual",
    amount: 25000,
    dueDate: "2025-10-15",
    status: "pagado",
    paymentDate: "2025-10-14",
    autoRenew: true,
    description: "Internet 300 Mbps",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    provider: "Netflix",
    category: "streaming",
    cycle: "mensual",
    amount: 8500,
    dueDate: "2025-10-20",
    status: "vencido",
    autoRenew: true,
    description: "Plan Premium",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    provider: "Metrogas",
    category: "gas",
    cycle: "bimestral",
    amount: 35000,
    dueDate: "2025-11-05",
    status: "pendiente",
    autoRenew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    provider: "Seguros Rivadavia",
    category: "seguro",
    cycle: "mensual",
    amount: 18000,
    dueDate: "2025-10-30",
    status: "pendiente",
    autoRenew: true,
    description: "Seguro de hogar",
    createdAt: new Date().toISOString()
  }
]

// Datos de ejemplo de CDTs
const mockCdts: Cdt[] = [
  {
    id: "1",
    institution: "Banco Nación",
    openingDate: "2025-01-15",
    initialAmount: 5000000,
    interestRate: 8.5,
    term: 365,
    dueDate: calculateDueDate("2025-01-15", 365),
    finalAmount: calculateFinalAmount(5000000, 8.5, 365),
    status: "activo",
    autoRenew: false,
    description: "Inversión a largo plazo",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    institution: "Banco Galicia",
    openingDate: "2025-06-01",
    initialAmount: 3000000,
    interestRate: 10.2,
    term: 180,
    dueDate: calculateDueDate("2025-06-01", 180),
    finalAmount: calculateFinalAmount(3000000, 10.2, 180),
    status: "activo",
    autoRenew: true,
    description: "CDT a 6 meses",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    institution: "Banco Santander",
    openingDate: "2025-03-10",
    initialAmount: 2000000,
    interestRate: 7.8,
    term: 90,
    dueDate: calculateDueDate("2025-03-10", 90),
    finalAmount: calculateFinalAmount(2000000, 7.8, 90),
    status: "activo",
    autoRenew: false,
    description: "CDT a corto plazo",
    createdAt: new Date().toISOString()
  }
]

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
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="debts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Deudas
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recibos
            </TabsTrigger>
            <TabsTrigger value="cdts" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              CDTs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="movements" className="my-4 space-y-4">
            <MovementsStats movements={mockMovements} />
            <MovementsReports movements={mockMovements} />
          </TabsContent>
          <TabsContent value="debts" className="my-4">
            <DebtsStats debts={mockDebts} payments={mockPayments} />
          </TabsContent>
          <TabsContent value="bills" className="my-4 space-y-4">
            <BillsStats bills={mockBills} />
            <BillsReports bills={mockBills} />
          </TabsContent>
          <TabsContent value="cdts" className="my-4 space-y-4">
            <CdtsStats cdts={mockCdts} />
            <CdtsReports cdts={mockCdts} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
  
