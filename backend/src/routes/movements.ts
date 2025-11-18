/**
 * Movements API routes.
 * @route GET /api/movements
 * @route GET /api/movements/:id
 * @route POST /api/movements
 * @route PUT /api/movements
 * @route DELETE /api/movements/:id
 */
import { Router } from 'express';
import { db } from '../db/index.js';
import { movements, insertMovementSchema } from '../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

/**
 * Normaliza categorías con y sin tildes para evitar duplicados.
 * @param category Categoría ingresada en el payload.
 */
function normalizeCategory(category: unknown) {
  if (typeof category !== 'string') return category;
  const normalized = category.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.toLowerCase() === 'educacion') {
    return 'educacion';
  }
  return category;
}

/** Listar todos los movimientos del usuario autenticado. */
router.get('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const allMovements = await db.select().from(movements).where(eq(movements.userId, userId));

    // Parsear tags de JSON string a array
    const parsedMovements = allMovements.map(movement => ({
      ...movement,
      tags: movement.tags ? JSON.parse(movement.tags) : []
    }));

    return res.json(parsedMovements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return res.status(500).json({ error: 'Error fetching movements' });
  }
});

/** Obtener un movimiento por ID. */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [movement] = await db
      .select()
      .from(movements)
      .where(and(eq(movements.id, req.params.id), eq(movements.userId, userId)));

    if (!movement) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    // Parsear tags de JSON string a array
    const parsedMovement = {
      ...movement,
      tags: movement.tags ? JSON.parse(movement.tags) : []
    };

    return res.json(parsedMovement);
  } catch (error) {
    console.error('Error fetching movement:', error);
    return res.status(500).json({ error: 'Error fetching movement' });
  }
});

/** Crear un movimiento; opcionalmente enlaza y marca pagado un recibo. */
router.post('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;

    // Convertir tags array a JSON string
    const tagsString = req.body.tags ? JSON.stringify(req.body.tags) : null;

    // Convertir fecha string a Date object
    const dateValue = req.body.date ? new Date(req.body.date) : new Date();

    // Convertir attachment vacío a null
    const attachment = req.body.attachment && req.body.attachment.trim() !== ''
      ? req.body.attachment
      : null;

    // Convertir amount a string (drizzle-zod espera string para decimal)
    const amountString = req.body.amount !== undefined ? String(req.body.amount) : undefined;

    const movementId = randomUUID();
    const dataToValidate = {
      ...req.body,
      category: normalizeCategory(req.body.category),
      amount: amountString,
      tags: tagsString,
      attachment,
      date: dateValue,
      id: movementId,
      createdAt: new Date(),
      userId,
    };

    const validatedData = insertMovementSchema.parse(dataToValidate);

    await db.insert(movements).values(validatedData);

    const [created] = await db
      .select()
      .from(movements)
      .where(and(eq(movements.id, movementId), eq(movements.userId, userId)));

    // Parsear tags de vuelta a array
    const parsedCreated = {
      ...created!,
      tags: created!.tags ? JSON.parse(created!.tags) : []
    };

    return res.status(201).json(parsedCreated);
  } catch (error) {
    console.error('Error creating movement:', error);
    return res.status(400).json({ error: 'Error creating movement', details: error });
  }
});

/** Actualizar un movimiento existente (y su vínculo con recibo, si aplica). */
router.put('/', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const { id, createdAt, userId: _ignoredUserId, ...updateData } = req.body;
    updateData.category = normalizeCategory(updateData.category);

    // Convert amount to string if it exists
    if (updateData.amount !== undefined) {
      updateData.amount = String(updateData.amount);
    }

    // Convertir tags array a JSON string si existe
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    // Convert date to Date object if it exists and is a string
    if (updateData.date !== undefined && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }

    await db
      .update(movements)
      .set(updateData)
      .where(and(eq(movements.id, req.body.id), eq(movements.userId, userId)));

    const [updated] = await db
      .select()
      .from(movements)
      .where(and(eq(movements.id, req.body.id), eq(movements.userId, userId)));

    if (!updated) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    // Parsear tags de vuelta a array
    const parsedUpdated = {
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : []
    };

    return res.json(parsedUpdated);
  } catch (error) {
    console.error('Error updating movement:', error);
    return res.status(400).json({ error: 'Error updating movement', details: error });
  }
});

/** Eliminar un movimiento (revierte pago de recibo si estaba vinculado). */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.authUser!.id;
    const [movement] = await db
      .select()
      .from(movements)
      .where(and(eq(movements.id, req.params.id), eq(movements.userId, userId)));

    if (!movement) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    await db.delete(movements).where(and(eq(movements.id, req.params.id), eq(movements.userId, userId)));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting movement:', error);
    return res.status(500).json({ error: 'Error deleting movement' });
  }
});

export default router;
