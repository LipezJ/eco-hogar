/**
 * Servicio de generación de notificaciones para vencimientos y presupuesto.
 */
import { and, eq, gt, lte, ne } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../db/index.js';
import { bills, cdts, debts, monthlyBudgets, notifications, payments } from '../db/schema.js';
import { getMonthlyBudgetSummary } from './budget.js';

const DEFAULT_DUE_SOON_DAYS = 3;

/** Combina condiciones SQL ignorando las no definidas. */
function combineConditions(...conditions: Array<SQL | undefined>) {
  const filtered = conditions.filter((condition): condition is SQL => condition !== undefined);
  if (filtered.length === 0) {
    throw new Error('No conditions provided');
  }
  const [first, ...rest] = filtered;
  let combined = first;
  for (const condition of rest) {
    combined = and(combined, condition);
  }
  return combined;
}

/** Filtro opcional por usuario; devuelve undefined si no se filtra. */
const userFilter = (
  column: typeof bills.userId | typeof cdts.userId | typeof debts.userId | typeof monthlyBudgets.userId,
  userId?: string
) => (userId ? eq(column as typeof bills.userId, userId) : undefined);

/** Verifica si ya existe una notificación para un recurso/evento. */
async function notificationExists(userId: string, resourceId: string, eventType: string) {
  const [existing] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.resourceId, resourceId), eq(notifications.eventType, eventType)))
    .limit(1);
  return Boolean(existing);
}

/** Crea una notificación del sistema. */
async function createNotification(params: {
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'alert'
  resourceId: string
  eventType: string
}) {
  const { userId, title, message, type, resourceId, eventType } = params;
  await db.insert(notifications).values({
    id: randomUUID(),
    userId,
    title,
    message,
    type,
    status: 'unread',
    resourceType: 'system',
    resourceId,
    eventType,
    createdAt: new Date(),
  });
}

export interface ProcessNotificationsOptions {
  referenceDate?: Date
  userId?: string
}

/**
 * Procesa notificaciones para vencimientos (recibos, deudas, CDTs) y alertas de presupuesto.
 * @param options referenceDate (default hoy) y userId opcional para filtrar.
 * @returns Conteo de notificaciones creadas.
 */
export async function processNotifications(options: ProcessNotificationsOptions = {}) {
  const { referenceDate = new Date(), userId } = options;
  const dueSoonDays = Number(process.env.NOTIFICATION_DUE_SOON_DAYS ?? DEFAULT_DUE_SOON_DAYS);
  const soonDate = new Date(referenceDate);
  soonDate.setDate(soonDate.getDate() + dueSoonDays);

  let created = 0;

  const overdueBillsWhere = combineConditions(
    userFilter(bills.userId, userId),
    ne(bills.status, 'pagado'),
    lte(bills.dueDate, referenceDate)
  );
  if (overdueBillsWhere) {
    const overdueBills = await db.select().from(bills).where(overdueBillsWhere);
    for (const bill of overdueBills) {
      const eventType = 'bill_overdue';
      if (await notificationExists(bill.userId, bill.id, eventType)) continue;
      await createNotification({
        userId: bill.userId,
        resourceId: bill.id,
        eventType,
        type: 'alert',
        title: `Recibo vencido: ${bill.provider}`,
        message: `El recibo de ${bill.provider} por $${Number(bill.amount).toLocaleString('es-ES')} vencio el ${new Date(bill.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const dueSoonBillsWhere = combineConditions(
    userFilter(bills.userId, userId),
    eq(bills.status, 'pendiente'),
    gt(bills.dueDate, referenceDate),
    lte(bills.dueDate, soonDate)
  );
  if (dueSoonBillsWhere) {
    const dueSoonBills = await db.select().from(bills).where(dueSoonBillsWhere);
    for (const bill of dueSoonBills) {
      const eventType = 'bill_due_soon';
      if (await notificationExists(bill.userId, bill.id, eventType)) continue;
      await createNotification({
        userId: bill.userId,
        resourceId: bill.id,
        eventType,
        type: 'warning',
        title: `Recibo proximo a vencer: ${bill.provider}`,
        message: `El recibo de ${bill.provider} vence el ${new Date(bill.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const overduePaymentsWhere = combineConditions(
    eq(payments.isPaid, false),
    lte(payments.dueDate, referenceDate),
    userId ? eq(debts.userId, userId) : undefined
  );
  if (overduePaymentsWhere) {
    const overduePayments = await db
      .select({
        paymentId: payments.id,
        debtId: payments.debtId,
        userId: debts.userId,
        dueDate: payments.dueDate,
        amount: payments.amount,
        installmentNumber: payments.installmentNumber,
        debtOrigin: debts.origin,
      })
      .from(payments)
      .innerJoin(debts, eq(payments.debtId, debts.id))
      .where(overduePaymentsWhere);

    for (const payment of overduePayments) {
      const eventType = `debt_payment_overdue_${payment.installmentNumber}`;
      if (await notificationExists(payment.userId, payment.paymentId, eventType)) continue;
      await createNotification({
        userId: payment.userId,
        resourceId: payment.paymentId,
        eventType,
        type: 'alert',
        title: `Cuota vencida: ${payment.debtOrigin}`,
        message: `La cuota #${payment.installmentNumber} (${Number(payment.amount).toLocaleString('es-ES')}) esta vencida desde el ${new Date(payment.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const dueSoonPaymentsWhere = combineConditions(
    eq(payments.isPaid, false),
    gt(payments.dueDate, referenceDate),
    lte(payments.dueDate, soonDate),
    userId ? eq(debts.userId, userId) : undefined
  );
  if (dueSoonPaymentsWhere) {
    const dueSoonPayments = await db
      .select({
        paymentId: payments.id,
        debtId: payments.debtId,
        userId: debts.userId,
        dueDate: payments.dueDate,
        amount: payments.amount,
        installmentNumber: payments.installmentNumber,
        debtOrigin: debts.origin,
      })
      .from(payments)
      .innerJoin(debts, eq(payments.debtId, debts.id))
      .where(dueSoonPaymentsWhere);

    for (const payment of dueSoonPayments) {
      const eventType = `debt_payment_due_soon_${payment.installmentNumber}`;
      if (await notificationExists(payment.userId, payment.paymentId, eventType)) continue;
      await createNotification({
        userId: payment.userId,
        resourceId: payment.paymentId,
        eventType,
        type: 'warning',
        title: `Cuota proxima: ${payment.debtOrigin}`,
        message: `La cuota #${payment.installmentNumber} vence el ${new Date(payment.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const overdueCdtsWhere = combineConditions(
    ne(cdts.status, 'cancelado'),
    lte(cdts.dueDate, referenceDate),
    userFilter(cdts.userId, userId)
  );
  if (overdueCdtsWhere) {
    const overdueCdts = await db.select().from(cdts).where(overdueCdtsWhere);
    for (const cdt of overdueCdts) {
      const eventType = 'cdt_overdue';
      if (await notificationExists(cdt.userId, cdt.id, eventType)) continue;
      await createNotification({
        userId: cdt.userId,
        resourceId: cdt.id,
        eventType,
        type: 'alert',
        title: `CDT vencido: ${cdt.institution}`,
        message: `El CDT en ${cdt.institution} por ${Number(cdt.finalAmount).toLocaleString('es-ES')} vencio el ${new Date(cdt.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const dueSoonCdtsWhere = combineConditions(
    eq(cdts.status, 'activo'),
    gt(cdts.dueDate, referenceDate),
    lte(cdts.dueDate, soonDate),
    userFilter(cdts.userId, userId)
  );
  if (dueSoonCdtsWhere) {
    const dueSoonCdts = await db.select().from(cdts).where(dueSoonCdtsWhere);
    for (const cdt of dueSoonCdts) {
      const eventType = 'cdt_due_soon';
      if (await notificationExists(cdt.userId, cdt.id, eventType)) continue;
      await createNotification({
        userId: cdt.userId,
        resourceId: cdt.id,
        eventType,
        type: 'warning',
        title: `CDT proximo a vencer: ${cdt.institution}`,
        message: `El CDT en ${cdt.institution} vence el ${new Date(cdt.dueDate).toLocaleDateString('es-ES')}.`,
      });
      created += 1;
    }
  }

  const budgets = userId
    ? await db.select().from(monthlyBudgets).where(eq(monthlyBudgets.userId, userId))
    : await db.select().from(monthlyBudgets);

  for (const budget of budgets) {
    const summary = await getMonthlyBudgetSummary(budget.userId, budget.year, budget.month);
    const usage = summary.summary.overall.usagePercentage;
    const resourceId = `${budget.year}-${budget.month}`;

    if (usage >= 100) {
      const eventType = `budget_100_${resourceId}`;
      if (!(await notificationExists(budget.userId, resourceId, eventType))) {
        await createNotification({
          userId: budget.userId,
          resourceId,
          eventType,
          type: 'alert',
          title: `Presupuesto agotado (${budget.month}/${budget.year})`,
          message: `Has alcanzado el 100% del presupuesto mensual (${summary.summary.overall.limit.toLocaleString('es-ES')} ${budget.currency}).`,
        });
        created += 1;
      }
      continue;
    }

    if (usage >= 80) {
      const eventType = `budget_80_${resourceId}`;
      if (!(await notificationExists(budget.userId, resourceId, eventType))) {
        await createNotification({
          userId: budget.userId,
          resourceId,
          eventType,
          type: 'warning',
          title: `Presupuesto al ${Math.round(usage)}%`,
          message: `Has usado el ${Math.round(usage)}% del presupuesto mensual (${summary.summary.overall.limit.toLocaleString('es-ES')} ${budget.currency}).`,
        });
        created += 1;
      }
    }
  }

  return { created };
}

/** Shortcut para procesar notificaciones de un solo usuario. */
export async function processNotificationsForUser(userId: string, referenceDate = new Date()) {
  return processNotifications({ userId, referenceDate });
}
