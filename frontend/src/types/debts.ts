import { z } from "zod/v4"

export const DebtType = z.enum(["deuda", "prestamo"])

export const DebtSchema = z.object({
  id: z.string(),
  type: DebtType,
  origin: z.string(), // Origen de la deuda o destino del préstamo
  amount: z.number().positive(),
  interestRate: z.number().min(0).max(100), // Tasa de interés anual en porcentaje
  installments: z.number().int().positive(), // Número de cuotas
  startDate: z.string(),
  paymentDay: z.number().int().min(1).max(31), // Día del mes para pago
  description: z.string().optional(),
  createdAt: z.string()
})

export const PaymentSchema = z.object({
  id: z.string(),
  debtId: z.string(),
  installmentNumber: z.number().int().positive(),
  dueDate: z.string(),
  amount: z.number().positive(),
  principal: z.number().positive(), // Capital
  interest: z.number().positive(), // Interés
  isPaid: z.boolean(),
  paidDate: z.string().optional(),
  createdAt: z.string()
})

export const CreateDebtSchema = DebtSchema.omit({
  id: true,
  createdAt: true
})

export const UpdateDebtSchema = DebtSchema.partial().required({ id: true })

export type Debt = z.infer<typeof DebtSchema>
export type Payment = z.infer<typeof PaymentSchema>
export type CreateDebt = z.infer<typeof CreateDebtSchema>
export type UpdateDebt = z.infer<typeof UpdateDebtSchema>

// Función para calcular cuota mensual (sistema francés)
export function calculateMonthlyPayment(
  amount: number,
  annualRate: number,
  installments: number
): number {
  if (annualRate === 0) {
    return amount / installments
  }

  const monthlyRate = annualRate / 100 / 12
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) /
                  (Math.pow(1 + monthlyRate, installments) - 1)

  return Math.round(payment * 100) / 100
}

// Función para generar tabla de amortización
export function generateAmortizationTable(debt: Debt): Payment[] {
  const payments: Payment[] = []
  const monthlyRate = debt.interestRate / 100 / 12
  const monthlyPayment = calculateMonthlyPayment(debt.amount, debt.interestRate, debt.installments)

  let remainingBalance = debt.amount
  const startDate = new Date(debt.startDate)

  for (let i = 1; i <= debt.installments; i++) {
    const interestAmount = remainingBalance * monthlyRate
    const principalAmount = monthlyPayment - interestAmount

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)
    dueDate.setDate(debt.paymentDay)

    payments.push({
      id: `${debt.id}-${i}`,
      debtId: debt.id,
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      amount: monthlyPayment,
      principal: Math.round(principalAmount * 100) / 100,
      interest: Math.round(interestAmount * 100) / 100,
      isPaid: false,
      createdAt: new Date().toISOString()
    })

    remainingBalance -= principalAmount
  }

  return payments
}

// Función para calcular saldo restante
export function calculateRemainingBalance(debt: Debt, payments: Payment[]): number {
  const paidPayments = payments.filter(p => p.isPaid)
  const totalPaidPrincipal = paidPayments.reduce((sum, p) => sum + p.principal, 0)
  return Math.round((debt.amount - totalPaidPrincipal) * 100) / 100
}

// Función para obtener próximos pagos por vencer
export function getUpcomingPayments(payments: Payment[], days: number = 7): Payment[] {
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  return payments.filter(p => {
    if (p.isPaid) return false
    const dueDate = new Date(p.dueDate)
    return dueDate >= now && dueDate <= futureDate
  })
}
