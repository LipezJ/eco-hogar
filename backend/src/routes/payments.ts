import { Router } from 'express';
import { db } from '../db/index.js';
import { payments } from '../db/schema.js';
import { and, asc, eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/payments?debtId= - List payments (optionally filtered by debt)
router.get('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const { debtId } = req.query as { debtId?: string };

    let result;
    if (debtId) {
      result = await db
        .select()
        .from(payments)
        .where(and(eq(payments.debtId, debtId), eq(payments.userId, userId)))
        .orderBy(asc(payments.installmentNumber));
    } else {
      result = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, userId))
        .orderBy(asc(payments.dueDate));
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Error fetching payments' });
  }
});

export default router;
