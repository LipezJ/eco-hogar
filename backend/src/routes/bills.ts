import { Router } from 'express';
import { db } from '../db/index.js';
import { bills, insertBillSchema } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/bills - Listar todos los recibos
router.get('/', async (_req, res) => {
  try {
    const allBills = await db.select().from(bills);
    return res.json(allBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ error: 'Error fetching bills' });
  }
});

// GET /api/bills/:id - Obtener un recibo por ID
router.get('/:id', async (req, res) => {
  try {
    const [bill] = await db
      .select()
      .from(bills)
      .where(eq(bills.id, req.params.id));

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    return res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return res.status(500).json({ error: 'Error fetching bill' });
  }
});

// POST /api/bills - Crear nuevo recibo
router.post('/', async (req, res) => {
  try {
    const billId = randomUUID();
    const validatedData = insertBillSchema.parse({
      ...req.body,
      amount: String(req.body.amount), // Convert number to string for decimal field
      dueDate: new Date(req.body.dueDate), // Convert string to Date
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined, // Convert string to Date if exists
      id: billId,
      createdAt: new Date(),
    });

    await db.insert(bills).values(validatedData);

    const [created] = await db
      .select()
      .from(bills)
      .where(eq(bills.id, billId));

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating bill:', error);
    return res.status(400).json({ error: 'Error creating bill', details: error });
  }
});

// PUT /api/bills - Actualizar recibo
router.put('/', async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    // Convert amount to string if it exists
    if (updateData.amount !== undefined) {
      updateData.amount = String(updateData.amount);
    }
    // Convert date fields to Date objects if they exist and are strings
    if (updateData.dueDate !== undefined && typeof updateData.dueDate === 'string') {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paymentDate !== undefined && typeof updateData.paymentDate === 'string') {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }

    await db
      .update(bills)
      .set(updateData)
      .where(eq(bills.id, req.body.id));

    const [updated] = await db
      .select()
      .from(bills)
      .where(eq(bills.id, req.body.id));

    if (!updated) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating bill:', error);
    return res.status(400).json({ error: 'Error updating bill', details: error });
  }
});

// DELETE /api/bills/:id - Eliminar recibo
router.delete('/:id', async (req, res) => {
  try {
    const [bill] = await db
      .select()
      .from(bills)
      .where(eq(bills.id, req.params.id));

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    await db.delete(bills).where(eq(bills.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting bill:', error);
    return res.status(500).json({ error: 'Error deleting bill' });
  }
});

export default router;
