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
  attachment: z.string().optional(),
  date: z.string(),
  createdAt: z.string()
})

export const CreateMovementSchema = MovementSchema.omit({
  id: true,
  createdAt: true
})

export const UpdateMovementSchema = MovementSchema.partial().required({ id: true })

export type Movement = z.infer<typeof MovementSchema>
export type CreateMovement = z.infer<typeof CreateMovementSchema>
export type UpdateMovement = z.infer<typeof UpdateMovementSchema>
