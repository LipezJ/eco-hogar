import { Router } from 'express';
import { db } from '../db/index.js';
import { accounts, insertAccountSchema } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/accounts - Listar todas las cuentas
router.get('/', async (_req, res) => {
  try {
    const allAccounts = await db.select().from(accounts);
    return res.json(allAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ error: 'Error fetching accounts' });
  }
});

// GET /api/accounts/:id - Obtener una cuenta por ID
router.get('/:id', async (req, res) => {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, req.params.id));

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return res.status(500).json({ error: 'Error fetching account' });
  }
});

// POST /api/accounts - Crear nueva cuenta
router.post('/', async (req, res) => {
  try {
    const accountId = randomUUID();
    const validatedData = insertAccountSchema.parse({
      ...req.body,
      balance: String(req.body.balance), // Convert number to string for decimal field
      id: accountId,
      createdAt: new Date(),
    });

    await db.insert(accounts).values(validatedData);

    const [created] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId));

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating account:', error);
    return res.status(400).json({ error: 'Error creating account', details: error });
  }
});

// PUT /api/accounts/:id - Actualizar cuenta
router.put('/:id', async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    // Convert balance to string if it exists
    if (updateData.balance !== undefined) {
      updateData.balance = String(updateData.balance);
    }

    await db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, req.params.id));

    const [updated] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, req.params.id));

    if (!updated) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error updating account:', error);
    return res.status(400).json({ error: 'Error updating account', details: error });
  }
});

// DELETE /api/accounts/:id - Eliminar cuenta
router.delete('/:id', async (req, res) => {
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, req.params.id));

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await db.delete(accounts).where(eq(accounts.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Error deleting account' });
  }
});

export default router;
