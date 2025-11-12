import { z } from "zod/v4"

export const AccountType = z.enum([
  "ahorro",
  "corriente",
  "inversion",
  "nomina",
  "efectivo",
  "otro"
])

export const Currency = z.enum([
  "ARS", // Peso Argentino
  "USD", // Dólar Estadounidense
  "EUR", // Euro
  "BRL", // Real Brasileño
  "CLP", // Peso Chileno
  "UYU", // Peso Uruguayo
  "MXN", // Peso Mexicano
  "COP", // Peso Colombiano
  "PEN", // Sol Peruano
  "otro"
])

export const AccountStatus = z.enum(["activa", "inactiva", "bloqueada"])

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(), // Nombre descriptivo de la cuenta
  institution: z.string(), // Banco o institución
  accountType: AccountType,
  accountNumber: z.string().optional(), // Número de cuenta (opcional por seguridad)
  currency: Currency,
  balance: z.number(), // Saldo actual
  isNational: z.boolean(), // Si es cuenta nacional o extranjera
  owner: z.string(), // Titular de la cuenta
  status: AccountStatus,
  description: z.string().optional(),
  createdAt: z.string()
})

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  createdAt: true
})

export const UpdateAccountSchema = AccountSchema.partial().required({ id: true })

export type Account = z.infer<typeof AccountSchema>
export type CreateAccount = z.infer<typeof CreateAccountSchema>
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>

// Tasas de cambio de ejemplo (en producción vendrían de una API)
export const exchangeRates: Record<string, number> = {
  ARS: 1,
  USD: 1000,
  EUR: 1100,
  BRL: 200,
  CLP: 1.2,
  UYU: 25,
  MXN: 55,
  COP: 0.25,
  PEN: 270,
  otro: 1
}

// Función para convertir a moneda base (ARS)
export function convertToBase(amount: number, currency: string): number {
  const rate = exchangeRates[currency] || 1
  return amount * rate
}

// Función para calcular total por moneda
export function getTotalByCurrency(accounts: Account[]): Record<string, number> {
  return accounts
    .filter(a => a.status === "activa")
    .reduce((acc, account) => {
      acc[account.currency] = (acc[account.currency] || 0) + account.balance
      return acc
    }, {} as Record<string, number>)
}

// Función para calcular total en moneda base
export function getTotalInBase(accounts: Account[]): number {
  return accounts
    .filter(a => a.status === "activa")
    .reduce((sum, account) => {
      return sum + convertToBase(account.balance, account.currency)
    }, 0)
}

// Función para calcular total por tipo de cuenta
export function getTotalByType(accounts: Account[]): Record<string, number> {
  return accounts
    .filter(a => a.status === "activa")
    .reduce((acc, account) => {
      const amountInBase = convertToBase(account.balance, account.currency)
      acc[account.accountType] = (acc[account.accountType] || 0) + amountInBase
      return acc
    }, {} as Record<string, number>)
}

// Función para separar cuentas nacionales vs extranjeras
export function getAccountsByLocation(accounts: Account[]): {
  national: Account[]
  foreign: Account[]
} {
  const active = accounts.filter(a => a.status === "activa")
  return {
    national: active.filter(a => a.isNational),
    foreign: active.filter(a => !a.isNational)
  }
}

// Función para calcular totales por ubicación
export function getTotalByLocation(accounts: Account[]): {
  national: number
  foreign: number
} {
  const { national, foreign } = getAccountsByLocation(accounts)
  return {
    national: getTotalInBase(national),
    foreign: getTotalInBase(foreign)
  }
}

// Función para obtener cuentas por propietario
export function getAccountsByOwner(accounts: Account[]): Record<string, Account[]> {
  return accounts
    .filter(a => a.status === "activa")
    .reduce((acc, account) => {
      if (!acc[account.owner]) {
        acc[account.owner] = []
      }
      acc[account.owner].push(account)
      return acc
    }, {} as Record<string, Account[]>)
}

// Función para formatear moneda
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    ARS: "$",
    USD: "US$",
    EUR: "€",
    BRL: "R$",
    CLP: "CLP$",
    UYU: "UYU$",
    MXN: "MX$",
    COP: "COL$",
    PEN: "S/",
    otro: ""
  }

  const symbol = symbols[currency] || ""
  return `${symbol}${amount.toLocaleString('es-ES')}`
}

// Función para obtener nombre de moneda
export function getCurrencyName(code: string): string {
  const names: Record<string, string> = {
    ARS: "Peso Argentino",
    USD: "Dólar",
    EUR: "Euro",
    BRL: "Real Brasileño",
    CLP: "Peso Chileno",
    UYU: "Peso Uruguayo",
    MXN: "Peso Mexicano",
    COP: "Peso Colombiano",
    PEN: "Sol Peruano",
    otro: "Otra"
  }

  return names[code] || code
}
