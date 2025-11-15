import { Router } from 'express';
import { z } from 'zod';
import { getMonthlyBudgetSummary, upsertMonthlyBudget } from '../services/budget.js';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

const monthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

const budgetPayloadSchema = monthYearSchema.extend({
  amount: z.number().nonnegative(),
  currency: z.string().min(1).max(10).default('COP'),
});

const resolveMonthYear = (queryMonth?: string | string[], queryYear?: string | string[]) => {
  const now = new Date();
  const month = queryMonth ? Number(Array.isArray(queryMonth) ? queryMonth[0] : queryMonth) : now.getMonth() + 1;
  const year = queryYear ? Number(Array.isArray(queryYear) ? queryYear[0] : queryYear) : now.getFullYear();
  return monthYearSchema.parse({ month, year });
};

router.get('/budget', async (req, res) => {
  try {
    const { month, year } = resolveMonthYear(req.query.month as string, req.query.year as string);
    const summary = await getMonthlyBudgetSummary(req.authUser!.id, year, month);
    return res.json(summary);
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return res.status(400).json({ error: 'Error fetching budget summary' });
  }
});

router.put('/budget', async (req, res) => {
  try {
    const parsed = budgetPayloadSchema.parse({
      month: Number(req.body?.month),
      year: Number(req.body?.year),
      amount: Number(req.body?.amount),
      currency: typeof req.body?.currency === 'string' ? req.body.currency : 'COP',
    });

    const config = await upsertMonthlyBudget({
      userId: req.authUser!.id,
      ...parsed,
      amount: parsed.amount.toFixed(2),
    });

    const summary = await getMonthlyBudgetSummary(req.authUser!.id, config.year, config.month);
    return res.json(summary);
  } catch (error) {
    console.error('Error saving budget configuration:', error);
    return res.status(400).json({ error: 'Error saving budget configuration', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
