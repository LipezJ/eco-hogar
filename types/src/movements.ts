import { z } from "zod/v4"

export const MovementType = z.enum(["ingreso", "egreso"])

export const MovementCategory = z.enum([
  "comida",
  "transporte",
  "servicios",
  "ocio",
  "salud",
  "educación",
  "vivienda",
  "otros"
])

export const MovementSchema = z.object({
  id: z.string(),
  type: MovementType,
  category: MovementCategory,
  amount: z.number().positive(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  attachment: z.string().nullable().optional(),
  date: z.string(),
  createdAt: z.string()
})

export const CreateMovementSchema = MovementSchema.omit({
  id: true,
  createdAt: true
})

export const UpdateMovementSchema = MovementSchema.partial().required({ id: true })

// Esquema para tags que acepta string o array y lo transforma a array opcional
const tagsField: z.ZodOptional<z.ZodArray<z.ZodString>> = z.preprocess((val) => {
  // Si es undefined o null, devolver undefined
  if (val === undefined || val === null) return undefined
  // Si ya es un array, devolverlo tal cual
  if (Array.isArray(val)) return val
  // Si es string, convertir a array
  if (typeof val === 'string') {
    if (val.length === 0) return undefined
    return val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  }
  return undefined
}, z.array(z.string()).optional()) as unknown as z.ZodOptional<z.ZodArray<z.ZodString>>

export const CreateMovementFormSchema = z.object({
  type: MovementType,
  category: MovementCategory,
  amount: z.number().positive(),
  description: z.string(),
  tags: tagsField,
  attachment: z.string().nullable().optional(),
  date: z.string()
})

export const UpdateMovementFormSchema = z.object({
  id: z.string(),
  type: MovementType.optional(),
  category: MovementCategory.optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  tags: tagsField,
  attachment: z.string().nullable().optional(),
  date: z.string().optional()
})

export type Movement = z.infer<typeof MovementSchema>
export type CreateMovement = z.infer<typeof CreateMovementSchema>
export type UpdateMovement = z.infer<typeof UpdateMovementSchema>
export type CreateMovementForm = z.infer<typeof CreateMovementFormSchema>
export type UpdateMovementForm = z.infer<typeof UpdateMovementFormSchema>
