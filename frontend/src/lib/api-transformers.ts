/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Account } from '@web-project/types/accounts';
import type { Bill } from '@web-project/types/bills';
import type { Movement } from '@web-project/types/movements';
import type { Debt, Payment } from '@web-project/types/debts';
import type { Cdt } from '@web-project/types/cdts';

/**
 * Convierte un valor decimal del backend a number seguro.
 * @param value decimal en string/number.
 * @returns number parseado o 0.
 */
const parseDecimal = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
};

/**
 * Normaliza una cuenta (decimal a number).
 * @param data payload bruto del backend.
 * @returns Account tipada.
 */
export const transformAccount = (data: any): Account => ({
  ...data,
  balance: parseDecimal(data.balance),
});

export const transformAccounts = (data: any[]): Account[] => {
  return Array.isArray(data) ? data.map(transformAccount) : [];
};

/**
 * Normaliza un recibo (amount a number).
 * @param data payload bruto.
 * @returns Bill tipada.
 */
export const transformBill = (data: any): Bill => ({
  ...data,
  amount: parseDecimal(data.amount),
});

export const transformBills = (data: any[]): Bill[] => {
  return Array.isArray(data) ? data.map(transformBill) : [];
};

/**
 * Normaliza un movimiento.
 * @param data payload bruto.
 * @returns Movement tipado.
 */
export const transformMovement = (data: any): Movement => ({
  ...data,
  amount: parseDecimal(data.amount),
});

export const transformMovements = (data: any[]): Movement[] => {
  return Array.isArray(data) ? data.map(transformMovement) : [];
};

/**
 * Normaliza una deuda (importe y tasa a number).
 * @param data payload bruto.
 * @returns Debt tipada.
 */
export const transformDebt = (data: any): Debt => ({
  ...data,
  amount: parseDecimal(data.amount),
  interestRate: parseDecimal(data.interestRate),
});

export const transformDebts = (data: any[]): Debt[] => {
  return Array.isArray(data) ? data.map(transformDebt) : [];
};

/**
 * Normaliza un pago de deuda (decimales y fechas).
 * @param data payload bruto.
 * @returns Payment tipado.
 */
export const transformPayment = (data: any): Payment => ({
  ...data,
  amount: parseDecimal(data.amount),
  principal: parseDecimal(data.principal),
  interest: parseDecimal(data.interest),
  installmentNumber: typeof data.installmentNumber === 'number'
    ? data.installmentNumber
    : parseInt(data.installmentNumber ?? '0', 10),
  isPaid: Boolean(data.isPaid),
  dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
  paidDate: data.paidDate ? new Date(data.paidDate).toISOString() : undefined,
  createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
});

export const transformPayments = (data: any[]): Payment[] => {
  return Array.isArray(data) ? data.map(transformPayment) : [];
};

/**
 * Normaliza un CDT (decimales a number).
 * @param data payload bruto.
 * @returns Cdt tipado.
 */
export const transformCdt = (data: any): Cdt => ({
  ...data,
  initialAmount: parseDecimal(data.initialAmount),
  finalAmount: parseDecimal(data.finalAmount),
  interestRate: parseDecimal(data.interestRate),
});

export const transformCdts = (data: any[]): Cdt[] => {
  return Array.isArray(data) ? data.map(transformCdt) : [];
};
