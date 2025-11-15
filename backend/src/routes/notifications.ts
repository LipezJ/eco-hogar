import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { notifications } from '../db/schema.js';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const limitParam = Number(req.query.limit ?? '20');
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return res.json(items);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Error fetching notifications' });
  }
});

router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const notificationId = req.params.id;

    await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    const [updated] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(400).json({ error: 'Error updating notification' });
  }
});

router.post('/read-all', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.status, 'unread')));

    return res.status(204).send();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(400).json({ error: 'Error marking notifications as read' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const notificationId = req.params.id;

    const [existing] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.delete(notifications).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(400).json({ error: 'Error deleting notification' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    await db.delete(notifications).where(eq(notifications.userId, userId));
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return res.status(400).json({ error: 'Error deleting notifications' });
  }
});

export default router;
