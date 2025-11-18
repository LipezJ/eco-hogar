/**
 * Accounts API routes.
 * @route GET /api/accounts
 * @route GET /api/accounts/:id
 * @route POST /api/accounts
 * @route PUT /api/accounts
 * @route DELETE /api/accounts/:id
 */
import { Router } from 'express';
import { db } from '../db/index.js';
import { accounts, insertAccountSchema } from '../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

/** Listar todas las cuentas del usuario autenticado. */
router.get('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const allAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return res.json(allAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ error: 'Error fetching accounts' });
  }
});

/** Obtener una cuenta puntual por ID (propiedad del usuario). */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return res.status(500).json({ error: 'Error fetching account' });
  }
});

/** Crear una nueva cuenta para el usuario actual. */
router.post('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const accountId = randomUUID();
    const validatedData = insertAccountSchema.parse({
      ...req.body,
      balance: String(req.body.balance), // Convert number to string for decimal field
      id: accountId,
      createdAt: new Date(),
      userId,
    });

    await db.insert(accounts).values(validatedData);

    const [created] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating account:', error);
    return res.status(400).json({ error: 'Error creating account', details: error });
  }
});

/** Actualizar datos de una cuenta existente. */
router.put('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const { id, createdAt, userId: _ignoredUserId, ...updateData } = req.body;

    // Convert balance to string if it exists
    if (updateData.balance !== undefined) {
      updateData.balance = String(updateData.balance);
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(and(eq(accounts.id, req.body.id), eq(accounts.userId, userId)));

    const [updated] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.body.id), eq(accounts.userId, userId)));

    if (!updated) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating account:', error);
    return res.status(400).json({ error: 'Error updating account', details: error });
  }
});

/** Eliminar una cuenta del usuario por ID. */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await db.delete(accounts).where(and(eq(accounts.id, req.params.id), eq(accounts.userId, userId)));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Error deleting account' });
  }
});

export default router;
