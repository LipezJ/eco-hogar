import { Router } from 'express';
import { db } from '../db/index.js';
import { movements, insertMovementSchema } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/movements - Listar todos los movimientos
router.get('/', async (_req, res) => {
  try {
    const allMovements = await db.select().from(movements);

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

// GET /api/movements/:id - Obtener un movimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const [movement] = await db
      .select()
      .from(movements)
      .where(eq(movements.id, req.params.id));

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

// POST /api/movements - Crear nuevo movimiento
router.post('/', async (req, res) => {
  try {

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
      amount: amountString,
      tags: tagsString,
      attachment,
      date: dateValue,
      id: movementId,
      createdAt: new Date(),
    };

    const validatedData = insertMovementSchema.parse(dataToValidate);

    await db.insert(movements).values(validatedData);

    const [created] = await db
      .select()
      .from(movements)
      .where(eq(movements.id, movementId));

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

// PUT /api/movements/:id - Actualizar movimiento
router.put('/:id', async (req, res) => {
  try {
    const { id, createdAt, ...updateData } = req.body;

    // Convert amount to string if it exists
    if (updateData.amount !== undefined) {
      updateData.amount = String(updateData.amount);
    }

    // Convertir tags array a JSON string si existe
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    await db
      .update(movements)
      .set(updateData)
      .where(eq(movements.id, req.params.id));

    const [updated] = await db
      .select()
      .from(movements)
      .where(eq(movements.id, req.params.id));

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

// DELETE /api/movements/:id - Eliminar movimiento
router.delete('/:id', async (req, res) => {
  try {
    const [movement] = await db
      .select()
      .from(movements)
      .where(eq(movements.id, req.params.id));

    if (!movement) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    await db.delete(movements).where(eq(movements.id, req.params.id));

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting movement:', error);
    return res.status(500).json({ error: 'Error deleting movement' });
  }
});

export default router;
