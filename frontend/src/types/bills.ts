import { z } from "zod/v4"

export const BillCycle = z.enum(["mensual", "bimestral", "trimestral", "semestral", "anual"])

export const BillStatus = z.enum(["pendiente", "pagado", "vencido"])

export const BillCategory = z.enum([
  "electricidad",
  "agua",
  "gas",
  "internet",
  "telefono",
  "cable",
  "streaming",
  "alquiler",
  "condominio",
  "seguro",
  "otros"
])

export const BillSchema = z.object({
  id: z.string(),
  provider: z.string(), // Proveedor del servicio
  category: BillCategory,
  cycle: BillCycle,
  amount: z.number().positive(),
  dueDate: z.string(), // Fecha límite de pago
  status: BillStatus,
  paymentDate: z.string().optional(), // Fecha en que se pagó
  attachment: z.string().optional(), // URL del comprobante
  description: z.string().optional(),
  autoRenew: z.boolean().optional(), // Si se renueva automáticamente
  createdAt: z.string()
})

export const CreateBillSchema = BillSchema.omit({
  id: true,
  createdAt: true
})

export const UpdateBillSchema = BillSchema.omit({
  createdAt: true
})

export type Bill = z.infer<typeof BillSchema>
export type CreateBill = z.infer<typeof CreateBillSchema>
export type UpdateBill = z.infer<typeof UpdateBillSchema>

// Función para obtener días hasta el vencimiento
export function getDaysUntilDue(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Función para determinar si un recibo está próximo a vencer
export function isDueSoon(bill: Bill, days: number = 7): boolean {
  if (bill.status !== "pendiente") return false
  const daysUntil = getDaysUntilDue(bill.dueDate)
  return daysUntil >= 0 && daysUntil <= days
}

// Función para determinar si un recibo está vencido
export function isOverdue(bill: Bill): boolean {
  if (bill.status === "pagado") return false
  return getDaysUntilDue(bill.dueDate) < 0
}

// Función para generar próximo recibo (autorenovación)
export function generateNextBill(bill: Bill): CreateBill {
  const dueDate = new Date(bill.dueDate)

  switch (bill.cycle) {
    case "mensual":
      dueDate.setMonth(dueDate.getMonth() + 1)
      break
    case "bimestral":
      dueDate.setMonth(dueDate.getMonth() + 2)
      break
    case "trimestral":
      dueDate.setMonth(dueDate.getMonth() + 3)
      break
    case "semestral":
      dueDate.setMonth(dueDate.getMonth() + 6)
      break
    case "anual":
      dueDate.setFullYear(dueDate.getFullYear() + 1)
      break
  }

  return {
    provider: bill.provider,
    category: bill.category,
    cycle: bill.cycle,
    amount: bill.amount,
    dueDate: dueDate.toISOString(),
    status: "pendiente",
    autoRenew: bill.autoRenew,
    description: bill.description
  }
}

// Función para obtener recibos próximos a vencer
export function getUpcomingBills(bills: Bill[], days: number = 7): Bill[] {
  return bills.filter(bill => isDueSoon(bill, days))
}

// Función para obtener recibos vencidos
export function getOverdueBills(bills: Bill[]): Bill[] {
  return bills.filter(bill => isOverdue(bill))
}

// Función para calcular total por categoría
export function getTotalByCategory(bills: Bill[]): Record<string, number> {
  return bills
    .filter(b => b.status === "pagado")
    .reduce((acc, bill) => {
      acc[bill.category] = (acc[bill.category] || 0) + bill.amount
      return acc
    }, {} as Record<string, number>)
}
