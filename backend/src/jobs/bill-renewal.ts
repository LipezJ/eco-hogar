/**
 * Job programado para renovar automaticamente los recibos recurrentes.
 * Toma recibos pagados con autoRenew activo y crea el siguiente vencimiento.
 */
import { randomUUID } from 'node:crypto';
import cron from 'node-cron';
import { and, eq, lte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bills } from '../db/schema.js';

type BillRecord = typeof bills.$inferSelect;

const DEFAULT_CRON = '0 3 * * *'; // Todos los dias a las 03:00

export interface BillRenewalResult {
  evaluated: number;
  created: number;
  failed: number;
  errors: Array<{ billId: string; message: string }>;
}

/**
 * Calcula la proxima fecha de vencimiento segun el ciclo configurado.
 */
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

/**
 * Duplica un recibo pagado para su siguiente vencimiento
 * y desactiva la renovacion del recibo anterior para no crear duplicados.
 */
async function renewBill(bill: BillRecord) {
  const nextDueDate = calculateNextDueDate(bill.dueDate, bill.cycle);
  const newBillId = randomUUID();

  await db.transaction(async (tx) => {
    // Inserta el nuevo recibo con los mismos datos basicos
    await tx.insert(bills).values({
      id: newBillId,
      userId: bill.userId,
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

    // Desactiva el autoRenew del recibo previo
    await tx.update(bills).set({ autoRenew: false }).where(eq(bills.id, bill.id));
  });

  console.log(`[AutoRenew] Generado recibo ${newBillId} a partir de ${bill.id} con vencimiento ${nextDueDate.toISOString()}`);
}

/**
 * Procesa las renovaciones elegibles hasta la fecha de referencia.
 * @param referenceDate Fecha limite para considerar vencimientos (por defecto hoy).
 */
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
    .where(and(eq(bills.autoRenew, true), eq(bills.status, 'pagado'), lte(bills.dueDate, referenceDate)));

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

/**
 * Arranca el scheduler CRON que ejecuta las renovaciones de manera periodica.
 */
export function startBillRenewalJob() {
  if (process.env.BILL_RENEW_DISABLED === 'true') {
    console.log('[AutoRenew] Job deshabilitado por BILL_RENEW_DISABLED=true');
    return;
  }

  const cronExpression = process.env.BILL_RENEW_CRON ?? DEFAULT_CRON;
  const timezone = process.env.BILL_RENEW_TZ;

  if (!cron.validate(cronExpression)) {
    console.error(`[AutoRenew] Expresion CRON invalida: "${cronExpression}". Usa BILL_RENEW_CRON para ajustarla.`);
    return;
  }

  cron.schedule(
    cronExpression,
    async () => {
      try {
        const summary = await processBillRenewals();
        console.log(`[AutoRenew] Job ejecutado: ${summary.created}/${summary.evaluated} renovados, ${summary.failed} errores`);
      } catch (error) {
        console.error('[AutoRenew] Error durante la ejecucion programada:', error);
      }
    },
    timezone ? { timezone } : undefined
  );

  // Ejecucion inicial al arrancar el servidor para no esperar al siguiente tick
  processBillRenewals()
    .then((summary) => console.log(`[AutoRenew] Ejecucion inicial completada: ${summary.created}/${summary.evaluated} renovados, ${summary.failed} errores`))
    .catch((error) => console.error('[AutoRenew] Error en la ejecucion inicial:', error));

  console.log(`[AutoRenew] Scheduler iniciado con CRON "${cronExpression}"${timezone ? ` (TZ: ${timezone})` : ''}`);
}
