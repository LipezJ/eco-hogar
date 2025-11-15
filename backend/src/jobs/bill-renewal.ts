import { randomUUID } from 'node:crypto';
import cron from 'node-cron';
import { and, eq, lte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bills } from '../db/schema.js';

type BillRecord = typeof bills.$inferSelect;

const DEFAULT_CRON = '0 3 * * *'; // Todos los días a las 03:00

export interface BillRenewalResult {
  evaluated: number;
  created: number;
  failed: number;
  errors: Array<{ billId: string; message: string }>;
}

function calculateNextDueDate(current: Date, cycle: BillRecord['cycle']): Date {
  const next = new Date(current);

  switch (cycle) {
    case 'mensual':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'bimestral':
      next.setMonth(next.getMonth() + 2);
      break;
    case 'trimestral':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'semestral':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'anual':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

async function renewBill(bill: BillRecord) {
  const nextDueDate = calculateNextDueDate(bill.dueDate, bill.cycle);
  const newBillId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(bills).values({
      id: newBillId,
      provider: bill.provider,
      category: bill.category,
      cycle: bill.cycle,
      amount: bill.amount,
      dueDate: nextDueDate,
      status: 'pendiente',
      paymentDate: null,
      attachment: null,
      description: bill.description,
      autoRenew: true,
      createdAt: new Date(),
    });

    await tx
      .update(bills)
      .set({ autoRenew: false })
      .where(eq(bills.id, bill.id));
  });

  console.log(`[AutoRenew] Generado recibo ${newBillId} a partir de ${bill.id} con vencimiento ${nextDueDate.toISOString()}`);
}

export async function processBillRenewals(referenceDate = new Date()): Promise<BillRenewalResult> {
  const result: BillRenewalResult = {
    evaluated: 0,
    created: 0,
    failed: 0,
    errors: [],
  };

  const candidates = await db
    .select()
    .from(bills)
    .where(
      and(
        eq(bills.autoRenew, true),
        eq(bills.status, 'pagado'),
        lte(bills.dueDate, referenceDate)
      )
    );

  result.evaluated = candidates.length;

  if (!candidates.length) {
    return result;
  }

  for (const bill of candidates) {
    try {
      await renewBill(bill);
      result.created += 1;
    } catch (error) {
      console.error(`[AutoRenew] Error al renovar ${bill.id}:`, error);
      result.failed += 1;
      result.errors.push({
        billId: bill.id,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return result;
}

export function startBillRenewalJob() {
  if (process.env.BILL_RENEW_DISABLED === 'true') {
    console.log('[AutoRenew] Job deshabilitado por BILL_RENEW_DISABLED=true');
    return;
  }

  const cronExpression = process.env.BILL_RENEW_CRON ?? DEFAULT_CRON;
  const timezone = process.env.BILL_RENEW_TZ;

  if (!cron.validate(cronExpression)) {
    console.error(`[AutoRenew] Expresión CRON inválida: "${cronExpression}". Usa BILL_RENEW_CRON para ajustarla.`);
    return;
  }

  cron.schedule(
    cronExpression,
    async () => {
      try {
        const summary = await processBillRenewals();
        console.log(`[AutoRenew] Job ejecutado: ${summary.created}/${summary.evaluated} renovados, ${summary.failed} errores`);
      } catch (error) {
        console.error('[AutoRenew] Error durante la ejecución programada:', error);
      }
    },
    timezone ? { timezone } : undefined
  );

  processBillRenewals()
    .then((summary) => console.log(`[AutoRenew] Ejecución inicial completada: ${summary.created}/${summary.evaluated} renovados, ${summary.failed} errores`))
    .catch((error) => console.error('[AutoRenew] Error en la ejecución inicial:', error));

  console.log(`[AutoRenew] Scheduler iniciado con CRON "${cronExpression}"${timezone ? ` (TZ: ${timezone})` : ''}`);
}
