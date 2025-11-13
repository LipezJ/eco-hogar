import { Router } from 'express';
import { db } from '../db/index.js';
import { payments } from '../db/schema.js';
import { asc, eq } from 'drizzle-orm';

const router = Router();

// GET /api/payments?debtId= - List payments (optionally filtered by debt)
router.get('/', async (req, res) => {
  try {
    const { debtId } = req.query as { debtId?: string };

    let result;
    if (debtId) {
      result = await db
        .select()
        .from(payments)
        .where(eq(payments.debtId, debtId))
        .orderBy(asc(payments.installmentNumber));
    } else {
      result = await db
        .select()
        .from(payments)
        .orderBy(asc(payments.dueDate));
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Error fetching payments' });
  }
});

export default router;
