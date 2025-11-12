import { z } from "zod/v4"

export const CdtStatus = z.enum(["activo", "vencido", "cancelado"])

export const CdtSchema = z.object({
  id: z.string(),
  institution: z.string(), // Banco o institución financiera
  openingDate: z.string(), // Fecha de apertura
  initialAmount: z.number().positive(), // Monto inicial
  interestRate: z.number().min(0).max(100), // Tasa de interés anual en porcentaje
  term: z.number().int().positive(), // Plazo en días
  dueDate: z.string(), // Fecha de vencimiento
  finalAmount: z.number().positive(), // Monto final (con intereses)
  status: CdtStatus,
  autoRenew: z.boolean().optional(), // Si se renueva automáticamente
  description: z.string().optional(),
  createdAt: z.string()
})

export const CreateCdtSchema = CdtSchema.omit({
  id: true,
  createdAt: true,
  finalAmount: true,
  dueDate: true
})

export const UpdateCdtSchema = CdtSchema.partial().required({ id: true })

export type Cdt = z.infer<typeof CdtSchema>
export type CreateCdt = z.infer<typeof CreateCdtSchema>
export type UpdateCdt = z.infer<typeof UpdateCdtSchema>

// Función para calcular el monto final con interés compuesto
export function calculateFinalAmount(
  initialAmount: number,
  annualRate: number,
  days: number
): number {
  // Fórmula de interés compuesto diario
  const dailyRate = annualRate / 100 / 365
  const finalAmount = initialAmount * Math.pow(1 + dailyRate, days)
  return Math.round(finalAmount * 100) / 100
}

// Función para calcular el interés ganado
export function calculateInterestEarned(
  initialAmount: number,
  finalAmount: number
): number {
  return Math.round((finalAmount - initialAmount) * 100) / 100
}

// Función para calcular la fecha de vencimiento
export function calculateDueDate(openingDate: string, days: number): string {
  const date = new Date(openingDate)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// Función para calcular días restantes
export function getDaysRemaining(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Función para calcular el progreso (días transcurridos / total días)
export function calculateProgress(openingDate: string, dueDate: string): number {
  const opening = new Date(openingDate)
  const due = new Date(dueDate)
  const now = new Date()

  const totalDays = Math.ceil((due.getTime() - opening.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((now.getTime() - opening.getTime()) / (1000 * 60 * 60 * 24))

  const progress = (elapsedDays / totalDays) * 100
  return Math.min(Math.max(progress, 0), 100) // Entre 0 y 100
}

// Función para calcular interés acumulado hasta la fecha
export function calculateAccruedInterest(
  initialAmount: number,
  annualRate: number,
  openingDate: string
): number {
  const opening = new Date(openingDate)
  const now = new Date()
  const daysPassed = Math.ceil((now.getTime() - opening.getTime()) / (1000 * 60 * 60 * 24))

  if (daysPassed <= 0) return 0

  const currentAmount = calculateFinalAmount(initialAmount, annualRate, daysPassed)
  return calculateInterestEarned(initialAmount, currentAmount)
}

// Función para determinar si está próximo a vencer
export function isDueSoon(cdt: Cdt, days: number = 30): boolean {
  if (cdt.status !== "activo") return false
  const daysRemaining = getDaysRemaining(cdt.dueDate)
  return daysRemaining >= 0 && daysRemaining <= days
}

// Función para determinar si está vencido
export function isOverdue(cdt: Cdt): boolean {
  if (cdt.status === "cancelado") return false
  return getDaysRemaining(cdt.dueDate) < 0
}

// Función para obtener CDTs próximos a vencer
export function getUpcomingCdts(cdts: Cdt[], days: number = 30): Cdt[] {
  return cdts.filter(cdt => isDueSoon(cdt, days))
}

// Función para calcular total invertido
export function getTotalInvested(cdts: Cdt[]): number {
  return cdts
    .filter(c => c.status === "activo")
    .reduce((sum, c) => sum + c.initialAmount, 0)
}

// Función para calcular total en retorno esperado
export function getTotalExpectedReturn(cdts: Cdt[]): number {
  return cdts
    .filter(c => c.status === "activo")
    .reduce((sum, c) => sum + c.finalAmount, 0)
}

// Función para calcular interés total esperado
export function getTotalExpectedInterest(cdts: Cdt[]): number {
  return cdts
    .filter(c => c.status === "activo")
    .reduce((sum, c) => sum + (c.finalAmount - c.initialAmount), 0)
}
