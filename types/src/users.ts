import { z } from "zod/v4";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;
