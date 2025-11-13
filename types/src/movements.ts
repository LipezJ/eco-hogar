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

// Esquema con preprocesamiento para transformar tags de string a array en formularios
const tagsPreprocessor = z.preprocess((val) => {
  // Si ya es un array, devolverlo tal cual
  if (Array.isArray(val)) return val
  // Si es string, convertir a array
  if (typeof val === 'string' && val.length > 0) {
    return val.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
  }
  // Si está vacío o es undefined, devolver undefined
  return undefined
}, z.array(z.string()).optional())

export const CreateMovementFormSchema = CreateMovementSchema.extend({
  tags: tagsPreprocessor
})

export const UpdateMovementFormSchema = UpdateMovementSchema.extend({
  tags: tagsPreprocessor
})

export type Movement = z.infer<typeof MovementSchema>
export type CreateMovement = z.infer<typeof CreateMovementSchema>
export type UpdateMovement = z.infer<typeof UpdateMovementSchema>
export type CreateMovementForm = z.infer<typeof CreateMovementFormSchema>
export type UpdateMovementForm = z.infer<typeof UpdateMovementFormSchema>
