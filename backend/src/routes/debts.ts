/**
 * Debts API routes.
 * @route GET /api/debts
 * @route GET /api/debts/:id
 * @route POST /api/debts
 * @route PUT /api/debts
 * @route DELETE /api/debts/:id
 * @route GET /api/debts/:id/payments
 * @route PUT /api/debts/:id/payments/:paymentId
 */
import { Router } from 'express';
import { db } from '../db/index.js';
import { debts, payments, insertDebtSchema } from '../db/schema.js';
import { eq, asc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

/**
 * Genera la tabla de amortización de una deuda (sistema francés).
 * @param debt Deuda normalizada con amount/interestRate/dates.
 * @returns Arreglo de cuotas programadas.
 */
function generateAmortizationTable(debt: any): any[] {
  const amortizationPayments: any[] = [];
  const amountNumber = Number(debt.amount);
  const interestRateNumber = Number(debt.interestRate);
  const monthlyRate = interestRateNumber / 100 / 12;

  // Calcular cuota mensual (sistema francés)
  let monthlyPayment: number;
  if (interestRateNumber === 0) {
    monthlyPayment = amountNumber / debt.installments;
  } else {
    monthlyPayment = amountNumber * (monthlyRate * Math.pow(1 + monthlyRate, debt.installments)) /
                    (Math.pow(1 + monthlyRate, debt.installments) - 1);
  }

  let remainingBalance = amountNumber;
  const startDate = new Date(debt.startDate);

  for (let i = 1; i <= debt.installments; i++) {
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(debt.paymentDay);

    const paymentIdBase = `${debt.id}-${i}`;
    const safePaymentId = paymentIdBase.length <= 36 ? paymentIdBase : randomUUID();

    amortizationPayments.push({
      id: safePaymentId,
      debtId: debt.id,
      userId: debt.userId,
      installmentNumber: i,
      dueDate,
      amount: (Math.round(monthlyPayment * 100) / 100).toFixed(2),
      principal: (Math.round(principalAmount * 100) / 100).toFixed(2),
      interest: (Math.round(interestAmount * 100) / 100).toFixed(2),
      isPaid: false,
      createdAt: new Date()
    });

    remainingBalance -= principalAmount;
  }

  return amortizationPayments;
}

/**
 * Error controlado al sincronizar pagos (por ejemplo, evitar borrar cuotas pagadas).
 */
class PaymentSyncError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'PaymentSyncError';
    this.statusCode = statusCode;
  }
}

/**
 * Sincroniza la tabla de pagos con la configuración de la deuda.
 * Inserta nuevas cuotas, actualiza fechas/montos y elimina cuotas no necesarias.
 * @throws PaymentSyncError cuando hay pagos pagados que quedarían inválidos.
 */
async function syncPaymentsForDebt(debt: any) {
  const existingPayments = await db
    .select()
    .from(payments)
    .where(and(eq(payments.debtId, debt.id), eq(payments.userId, debt.userId)))
    .orderBy(asc(payments.installmentNumber));

  const amortizationTable = generateAmortizationTable(debt);

  if (existingPayments.length === 0) {
    if (amortizationTable.length > 0) {
      await db.insert(payments).values(amortizationTable);
    }
    return;
  }

  const highestPaidInstallment = existingPayments
    .filter((payment) => payment.isPaid)
    .reduce((max, payment) => Math.max(max, payment.installmentNumber), 0);

  if (highestPaidInstallment > debt.installments) {
    throw new PaymentSyncError('No se puede reducir el número de cuotas por debajo de las ya pagadas.');
  }

  const scheduleMap = new Map(amortizationTable.map((payment) => [payment.installmentNumber, payment]));
  const existingMap = new Map(existingPayments.map((payment) => [payment.installmentNumber, payment]));

  const updates: Array<{ id: string; scheduled: any }> = [];
  const inserts: any[] = [];

  for (const scheduled of amortizationTable) {
    const existing = existingMap.get(scheduled.installmentNumber);
    if (existing) {
      updates.push({ id: existing.id, scheduled });
    } else {
      inserts.push(scheduled);
    }
  }

  const removals = existingPayments.filter((payment) => !scheduleMap.has(payment.installmentNumber));

  if (removals.some((payment) => payment.isPaid)) {
    throw new PaymentSyncError('No se pueden eliminar cuotas que ya fueron pagadas.');
  }

  for (const update of updates) {
    const { scheduled } = update;
    await db
      .update(payments)
      .set({
        dueDate: scheduled.dueDate,
        amount: scheduled.amount,
        principal: scheduled.principal,
        interest: scheduled.interest,
      })
      .where(and(eq(payments.id, update.id), eq(payments.userId, debt.userId)));
  }

  if (inserts.length > 0) {
    await db.insert(payments).values(inserts);
  }

  for (const removal of removals) {
    await db.delete(payments).where(and(eq(payments.id, removal.id), eq(payments.userId, debt.userId)));
  }
}

/** Listar todas las deudas del usuario autenticado. */
router.get('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const allDebts = await db.select().from(debts).where(eq(debts.userId, userId));
    return res.json(allDebts);
  } catch (error) {
    console.error('Error fetching debts:', error);
    return res.status(500).json({ error: 'Error fetching debts' });
  }
});

/** Obtener una deuda por ID. */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [debt] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, req.params.id), eq(debts.userId, userId)));

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    return res.json(debt);
  } catch (error) {
    console.error('Error fetching debt:', error);
    return res.status(500).json({ error: 'Error fetching debt' });
  }
});

/** Obtener la tabla de pagos/amortización de una deuda. */
router.get('/:id/payments', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    // Primero buscar los pagos existentes en la base de datos
    const existingPayments = await db
      .select()
      .from(payments)
      .where(and(eq(payments.debtId, req.params.id), eq(payments.userId, userId)))
      .orderBy(asc(payments.installmentNumber));

    if (existingPayments.length > 0) {
      return res.json(existingPayments);
    }

    // Si no hay pagos, generar la tabla de amortización
    const [debt] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, req.params.id), eq(debts.userId, userId)));

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    const amortizationTable = generateAmortizationTable(debt);

    // Guardar los pagos generados en la base de datos
    if (amortizationTable.length > 0) {
      await db.insert(payments).values(amortizationTable);
    }

    return res.json(amortizationTable);
  } catch (error) {
    console.error('Error fetching debt payments:', error);
    return res.status(500).json({ error: 'Error fetching debt payments' });
  }
});

/** Marcar un pago específico como pagado/no pagado. */
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const { isPaid, paidDate } = req.body;

    await db
      .update(payments)
      .set({
        isPaid,
        paidDate: paidDate ? new Date(paidDate) : null
      })
      .where(and(eq(payments.id, req.params.paymentId), eq(payments.debtId, req.params.id), eq(payments.userId, userId)));

    const [updated] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, req.params.paymentId), eq(payments.debtId, req.params.id), eq(payments.userId, userId)));

    if (!updated) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(400).json({ error: 'Error updating payment', details: error });
  }
});

/** Crear una nueva deuda y generar sus pagos asociados. */
router.post('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const debtId = randomUUID();
    const validatedData = insertDebtSchema.parse({
      ...req.body,
      amount: String(req.body.amount), // Convert number to string for decimal field
      interestRate: String(req.body.interestRate), // Convert number to string for decimal field
      startDate: new Date(req.body.startDate), // Convert string to Date
      id: debtId,
      createdAt: new Date(),
      userId,
    });

    await db.insert(debts).values(validatedData);

    const [created] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, debtId), eq(debts.userId, userId)));

    await syncPaymentsForDebt(created);

    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof PaymentSyncError) {
      console.error('Error syncing debt payments:', error);
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating debt:', error);
    return res.status(400).json({ error: 'Error creating debt', details: error });
  }
});

/** Actualizar una deuda existente y sincronizar pagos. */
router.put('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const { id, createdAt, userId: _ignoredUserId, ...updateData } = req.body;

    // Convert decimal fields to strings if they exist
    if (updateData.amount !== undefined) {
      updateData.amount = String(updateData.amount);
    }
    if (updateData.interestRate !== undefined) {
      updateData.interestRate = String(updateData.interestRate);
    }
    // Convert startDate to Date object if it exists and is a string
    if (updateData.startDate !== undefined && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }

    await db
      .update(debts)
      .set(updateData)
      .where(and(eq(debts.id, req.body.id), eq(debts.userId, userId)));

    const [updated] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, req.body.id), eq(debts.userId, userId)));

    if (!updated) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    await syncPaymentsForDebt(updated);

    return res.json(updated);
  } catch (error) {
    if (error instanceof PaymentSyncError) {
      console.error('Error syncing debt payments:', error);
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error updating debt:', error);
    return res.status(400).json({ error: 'Error updating debt', details: error });
  }
});

/** Eliminar una deuda y sus pagos asociados. */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [debt] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, req.params.id), eq(debts.userId, userId)));

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    // Primero eliminar los pagos asociados
    await db.delete(payments).where(and(eq(payments.debtId, req.params.id), eq(payments.userId, userId)));

    // Luego eliminar la deuda
    await db.delete(debts).where(and(eq(debts.id, req.params.id), eq(debts.userId, userId)));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting debt:', error);
    return res.status(500).json({ error: 'Error deleting debt' });
  }
});

export default router;
