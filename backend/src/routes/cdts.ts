import { Router } from 'express';
import { db } from '../db/index.js';
import { cdts, insertCdtSchema } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// Función auxiliar para calcular monto final con interés compuesto
function calculateFinalAmount(initialAmount: number, annualRate: number, days: number): number {
  const dailyRate = annualRate / 100 / 365;
  const finalAmount = initialAmount * Math.pow(1 + dailyRate, days);
  return Math.round(finalAmount * 100) / 100;
}

// Función auxiliar para calcular fecha de vencimiento
function calculateDueDate(openingDate: string, days: number): Date {
  const date = new Date(openingDate);
  date.setDate(date.getDate() + days);
  return date;
}

// GET /api/cdts - Listar todos los CDTs
router.get('/', async (_req, res) => {
  try {
    const allCdts = await db.select().from(cdts);
    return res.json(allCdts);
  } catch (error) {
    console.error('Error fetching CDTs:', error);
    return res.status(500).json({ error: 'Error fetching CDTs' });
  }
});

// GET /api/cdts/:id - Obtener un CDT por ID
router.get('/:id', async (req, res) => {
  try {
    const [cdt] = await db
      .select()
      .from(cdts)
      .where(eq(cdts.id, req.params.id));

    if (!cdt) {
      return res.status(404).json({ error: 'CDT not found' });
    }

    return res.json(cdt);
  } catch (error) {
    console.error('Error fetching CDT:', error);
    return res.status(500).json({ error: 'Error fetching CDT' });
  }
});

// POST /api/cdts - Crear nuevo CDT
router.post('/', async (req, res) => {
  try {
    // Calcular automáticamente finalAmount y dueDate
    const finalAmount = calculateFinalAmount(
      req.body.initialAmount,
      req.body.interestRate,
      req.body.term
    );

    const dueDate = calculateDueDate(req.body.openingDate, req.body.term);

    const cdtId = randomUUID();
    const validatedData = insertCdtSchema.parse({
      ...req.body,
      initialAmount: String(req.body.initialAmount), // Convert number to string for decimal field
      interestRate: String(req.body.interestRate), // Convert number to string for decimal field
      finalAmount: String(finalAmount), // Convert number to string for decimal field
      openingDate: new Date(req.body.openingDate), // Convert string to Date
      dueDate: dueDate, // Already a Date object from calculateDueDate
      id: cdtId,
      createdAt: new Date(),
    });

    await db.insert(cdts).values(validatedData);

    const [created] = await db
      .select()
      .from(cdts)
      .where(eq(cdts.id, cdtId));

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating CDT:', error);
    return res.status(400).json({ error: 'Error creating CDT', details: error });
  }
});

// PUT /api/cdts/:id - Actualizar CDT
router.put('/', async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    // Convert decimal fields to strings if they exist
    if (updateData.initialAmount !== undefined) {
      updateData.initialAmount = String(updateData.initialAmount);
    }
    if (updateData.interestRate !== undefined) {
      updateData.interestRate = String(updateData.interestRate);
    }
    // Convert openingDate to Date if it exists and is a string
    if (updateData.openingDate !== undefined && typeof updateData.openingDate === 'string') {
      updateData.openingDate = new Date(updateData.openingDate);
    }

    // Si se actualizan campos que afectan el cálculo, recalcular finalAmount y dueDate
    if (updateData.initialAmount || updateData.interestRate || updateData.term || updateData.openingDate) {
      const [currentCdt] = await db
        .select()
        .from(cdts)
        .where(eq(cdts.id, req.body.id));

      if (!currentCdt) {
        return res.status(404).json({ error: 'CDT not found' });
      }

      const initialAmount = updateData.initialAmount ?? currentCdt.initialAmount;
      const interestRate = updateData.interestRate ?? currentCdt.interestRate;
      const term = updateData.term ?? currentCdt.term;
      const openingDate = updateData.openingDate ?? currentCdt.openingDate;

      const finalAmountCalculated = calculateFinalAmount(
        Number(initialAmount),
        Number(interestRate),
        term
      );

      updateData.finalAmount = String(finalAmountCalculated);
      // openingDate can be a Date object or string, ensure it's a string for calculateDueDate
      const openingDateStr = openingDate instanceof Date ? openingDate.toISOString() : openingDate.toString();
      updateData.dueDate = calculateDueDate(openingDateStr, term);
    }

    await db
      .update(cdts)
      .set(updateData)
      .where(eq(cdts.id, req.body.id));

    const [updated] = await db
      .select()
      .from(cdts)
      .where(eq(cdts.id, req.body.id));

    if (!updated) {
      return res.status(404).json({ error: 'CDT not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating CDT:', error);
    return res.status(400).json({ error: 'Error updating CDT', details: error });
  }
});

// DELETE /api/cdts/:id - Eliminar CDT
router.delete('/:id', async (req, res) => {
  try {
    const [cdt] = await db
      .select()
      .from(cdts)
      .where(eq(cdts.id, req.params.id));

    if (!cdt) {
      return res.status(404).json({ error: 'CDT not found' });
    }

    await db.delete(cdts).where(eq(cdts.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting CDT:', error);
    return res.status(500).json({ error: 'Error deleting CDT' });
  }
});

export default router;
