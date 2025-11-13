import type { Account } from '@web-project/types/accounts';
import type { Bill } from '@web-project/types/bills';
import type { Movement } from '@web-project/types/movements';
import type { Debt, Payment } from '@web-project/types/debts';
import type { Cdt } from '@web-project/types/cdts';

// Helper para convertir decimales de string a number
const parseDecimal = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
};

// Transformar Account del backend
export const transformAccount = (data: any): Account => ({
  ...data,
  balance: parseDecimal(data.balance),
});

export const transformAccounts = (data: any[]): Account[] => {
  return Array.isArray(data) ? data.map(transformAccount) : [];
};

// Transformar Bill del backend
export const transformBill = (data: any): Bill => ({
  ...data,
  amount: parseDecimal(data.amount),
});

export const transformBills = (data: any[]): Bill[] => {
  return Array.isArray(data) ? data.map(transformBill) : [];
};

// Transformar Movement del backend
export const transformMovement = (data: any): Movement => ({
  ...data,
  amount: parseDecimal(data.amount),
});

export const transformMovements = (data: any[]): Movement[] => {
  return Array.isArray(data) ? data.map(transformMovement) : [];
};

// Transformar Debt del backend
export const transformDebt = (data: any): Debt => ({
  ...data,
  amount: parseDecimal(data.amount),
  interestRate: parseDecimal(data.interestRate),
});

export const transformDebts = (data: any[]): Debt[] => {
  return Array.isArray(data) ? data.map(transformDebt) : [];
};

// Transformar Payment del backend
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

// Transformar CDT del backend
export const transformCdt = (data: any): Cdt => ({
  ...data,
  initialAmount: parseDecimal(data.initialAmount),
  finalAmount: parseDecimal(data.finalAmount),
  interestRate: parseDecimal(data.interestRate),
});

export const transformCdts = (data: any[]): Cdt[] => {
  return Array.isArray(data) ? data.map(transformCdt) : [];
};
