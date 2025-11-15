import { randomUUID } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bills, cdts, movements, monthlyBudgets, payments } from '../db/schema.js';

type DecimalLike = string | number | null | undefined;

const toNumber = (value: DecimalLike): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getMonthDateRange = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1, 0, 0, 0));
  return { start, end };
};

export async function findMonthlyBudget(userId: string, year: number, month: number) {
  const [existing] = await db
    .select()
    .from(monthlyBudgets)
    .where(and(eq(monthlyBudgets.year, year), eq(monthlyBudgets.month, month), eq(monthlyBudgets.userId, userId)));
  return existing ?? null;
}

export async function upsertMonthlyBudget(params: { userId: string; year: number; month: number; amount: string; currency: string }) {
  const { userId, year, month, amount, currency } = params;
  const existing = await findMonthlyBudget(userId, year, month);

  if (existing) {
    await db
      .update(monthlyBudgets)
      .set({
        amount,
        currency,
        updatedAt: new Date(),
      })
      .where(eq(monthlyBudgets.id, existing.id));

    return {
      ...existing,
      amount,
      currency,
      updatedAt: new Date(),
    };
  }

  const record = {
    id: randomUUID(),
    userId,
    year,
    month,
    amount,
    currency,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(monthlyBudgets).values(record);
  return record;
}

export async function getMonthlyBudgetSummary(userId: string, year: number, month: number) {
  const { start, end } = getMonthDateRange(year, month);
  const config = await findMonthlyBudget(userId, year, month);

  const [movementTotals] = await db
    .select({
      income: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'ingreso' THEN ${movements.amount} ELSE 0 END), 0)`,
      expenses: sql<string>`COALESCE(SUM(CASE WHEN ${movements.type} = 'egreso' THEN ${movements.amount} ELSE 0 END), 0)`,
    })
    .from(movements)
    .where(and(eq(movements.userId, userId), sql`${movements.date} >= ${start} AND ${movements.date} < ${end}`));

  const [debtPaymentTotals] = await db
    .select({
      paymentsTotal: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.userId, userId),
        eq(payments.isPaid, true),
        sql`${payments.paidDate} IS NOT NULL`,
        sql`${payments.paidDate} >= ${start} AND ${payments.paidDate} < ${end}`,
      ),
    );

  const billsInRange = await db
    .select({
      amount: bills.amount,
      paymentDate: bills.paymentDate,
      dueDate: bills.dueDate,
      status: bills.status,
    })
    .from(bills)
    .where(and(
      eq(bills.userId, userId),
      sql`COALESCE(${bills.paymentDate}, ${bills.dueDate}) >= ${start} AND COALESCE(${bills.paymentDate}, ${bills.dueDate}) < ${end}`
    ));

  const [cdtTotals] = await db
    .select({
      invested: sql<string>`COALESCE(SUM(${cdts.initialAmount}), 0)`,
    })
    .from(cdts)
    .where(and(eq(cdts.userId, userId), sql`${cdts.openingDate} >= ${start} AND ${cdts.openingDate} < ${end}`));

  const paidBillsTotal = billsInRange
    .filter((bill) => bill.paymentDate)
    .reduce((sum, bill) => sum + toNumber(bill.amount), 0);
  const pendingBillsTotal = billsInRange
    .filter((bill) => !bill.paymentDate)
    .reduce((sum, bill) => sum + toNumber(bill.amount), 0);
  const billsTotal = paidBillsTotal + pendingBillsTotal;

  const expenses = toNumber(movementTotals?.expenses);
  const income = toNumber(movementTotals?.income);
  const debtPaymentsTotal = toNumber(debtPaymentTotals?.paymentsTotal);
  const investedCdts = toNumber(cdtTotals?.invested);

  const budgetLimit = toNumber(config?.amount);
  const totalUsed = expenses + debtPaymentsTotal + billsTotal + investedCdts;
  const remaining = budgetLimit - totalUsed;
  const usagePercentage = budgetLimit > 0 ? Math.min((totalUsed / budgetLimit) * 100, 100) : 0;

  return {
    config,
    summary: {
      year,
      month,
      totals: {
        movements: {
          expenses,
          income,
          net: expenses - income,
        },
        debts: {
          payments: debtPaymentsTotal,
        },
        bills: {
          total: billsTotal,
          paid: paidBillsTotal,
          pending: pendingBillsTotal,
        },
        cdts: {
          invested: investedCdts,
        },
      },
      overall: {
        limit: budgetLimit,
        used: totalUsed,
        remaining,
        usagePercentage,
      },
    },
  };
}
