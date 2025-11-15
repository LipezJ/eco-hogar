import { Router } from 'express';
import { processBillRenewals } from '../jobs/bill-renewal.js';
import { processNotifications } from '../services/notifications.js';
import { db } from '../db/index.js';
import { notifications, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const router = Router();

router.post('/bill-renewal', async (req, res) => {
  try {
    const { referenceDate } = req.body ?? {};
    const summary = await processBillRenewals(referenceDate ? new Date(referenceDate) : new Date());
    return res.json({
      message: 'Bill renewal job triggered.',
      summary,
    });
  } catch (error) {
    console.error('[DevTools] Error ejecutando bill renewal:', error);
    return res.status(500).json({ error: 'No se pudo ejecutar el job', details: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/notifications/create-admin', async (_req, res) => {
  try {
    const [adminUser] = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const notification = {
      id: randomUUID(),
      userId: adminUser.id,
      title: 'Notificación de prueba',
      message: 'Esta es una notificación generada desde dev-tools.',
      type: 'info' as const,
      status: 'unread' as const,
      resourceType: 'dev-tool',
      resourceId: randomUUID(),
      eventType: 'dev_tool_manual',
      createdAt: new Date(),
    };

    await db.insert(notifications).values(notification);

    return res.json({
      message: 'Notificación creada para el usuario admin.',
      notification,
    });
  } catch (error) {
    console.error('[DevTools] Error creando notificación:', error);
    return res.status(500).json({ error: 'No se pudo crear la notificación', details: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/notifications/run-cron', async (req, res) => {
  try {
    const { referenceDate } = req.body ?? {};
    const summary = await processNotifications({
      referenceDate: referenceDate ? new Date(referenceDate) : new Date()
    });
    return res.json({
      message: 'Notification job triggered.',
      summary,
    });
  } catch (error) {
    console.error('[DevTools] Error ejecutando notification job:', error);
    return res.status(500).json({ error: 'No se pudo ejecutar el job de notificaciones', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
