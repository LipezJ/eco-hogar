import { Router } from 'express';
import { processBillRenewals } from '../jobs/bill-renewal.js';

const router = Router();

router.post('/bill-renewal', async (req, res) => {
  try {
    const { referenceDate } = req.body ?? {};
    const summary = await processBillRenewals(referenceDate ? new Date(referenceDate) : new Date());
    res.json({
      message: 'Bill renewal job triggered.',
      summary,
    });
  } catch (error) {
    console.error('[DevTools] Error ejecutando bill renewal:', error);
    res.status(500).json({ error: 'No se pudo ejecutar el job', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
