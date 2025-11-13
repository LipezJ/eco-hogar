import { Router } from 'express';
import { db } from '../db/index.js';
import { debts, payments, insertDebtSchema } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// Función auxiliar para generar tabla de amortización
function generateAmortizationTable(debt: any): any[] {
  const amortizationPayments: any[] = [];
  const monthlyRate = debt.interestRate / 100 / 12;

  // Calcular cuota mensual (sistema francés)
  let monthlyPayment: number;
  if (debt.interestRate === 0) {
    monthlyPayment = debt.amount / debt.installments;
  } else {
    monthlyPayment = debt.amount * (monthlyRate * Math.pow(1 + monthlyRate, debt.installments)) /
                    (Math.pow(1 + monthlyRate, debt.installments) - 1);
  }

  let remainingBalance = debt.amount;
  const startDate = new Date(debt.startDate);

  for (let i = 1; i <= debt.installments; i++) {
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = monthlyPayment - interestAmount;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(debt.paymentDay);

    amortizationPayments.push({
      id: `${debt.id}-${i}`,
      debtId: debt.id,
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      amount: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalAmount * 100) / 100,
      interest: Math.round(interestAmount * 100) / 100,
      isPaid: false,
      createdAt: new Date().toISOString()
    });

    remainingBalance -= principalAmount;
  }

  return amortizationPayments;
}

// GET /api/debts - Listar todas las deudas
router.get('/', async (_req, res) => {
  try {
    const allDebts = await db.select().from(debts);
    return res.json(allDebts);
  } catch (error) {
    console.error('Error fetching debts:', error);
    return res.status(500).json({ error: 'Error fetching debts' });
  }
});

// GET /api/debts/:id - Obtener una deuda por ID
router.get('/:id', async (req, res) => {
  try {
    const [debt] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, req.params.id));

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    return res.json(debt);
  } catch (error) {
    console.error('Error fetching debt:', error);
    return res.status(500).json({ error: 'Error fetching debt' });
  }
});

// GET /api/debts/:id/payments - Obtener tabla de amortización de una deuda
router.get('/:id/payments', async (req, res) => {
  try {
    // Primero buscar los pagos existentes en la base de datos
    const existingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.debtId, req.params.id));

    if (existingPayments.length > 0) {
      return res.json(existingPayments);
    }

    // Si no hay pagos, generar la tabla de amortización
    const [debt] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, req.params.id));

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

// PUT /api/debts/:id/payments/:paymentId - Marcar un pago como realizado
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const { isPaid, paidDate } = req.body;

    await db
      .update(payments)
      .set({
        isPaid,
        paidDate: paidDate ? new Date(paidDate) : null
      })
      .where(eq(payments.id, req.params.paymentId));

    const [updated] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, req.params.paymentId));

    if (!updated) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(400).json({ error: 'Error updating payment', details: error });
  }
});

// POST /api/debts - Crear nueva deuda
router.post('/', async (req, res) => {
  try {
    const debtId = randomUUID();
    const validatedData = insertDebtSchema.parse({
      ...req.body,
      id: debtId,
      createdAt: new Date(),
    });

    await db.insert(debts).values(validatedData);

    const [created] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, debtId));

    // Generar automáticamente la tabla de amortización
    const amortizationTable = generateAmortizationTable(created);
    if (amortizationTable.length > 0) {
      await db.insert(payments).values(amortizationTable);
    }

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating debt:', error);
    return res.status(400).json({ error: 'Error creating debt', details: error });
  }
});

// PUT /api/debts/:id - Actualizar deuda
router.put('/:id', async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    await db
      .update(debts)
      .set(updateData)
      .where(eq(debts.id, req.params.id));

    const [updated] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, req.params.id));

    if (!updated) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating debt:', error);
    return res.status(400).json({ error: 'Error updating debt', details: error });
  }
});

// DELETE /api/debts/:id - Eliminar deuda (y sus pagos asociados)
router.delete('/:id', async (req, res) => {
  try {
    const [debt] = await db
      .select()
      .from(debts)
      .where(eq(debts.id, req.params.id));

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    // Primero eliminar los pagos asociados
    await db.delete(payments).where(eq(payments.debtId, req.params.id));

    // Luego eliminar la deuda
    await db.delete(debts).where(eq(debts.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting debt:', error);
    return res.status(500).json({ error: 'Error deleting debt' });
  }
});

export default router;
