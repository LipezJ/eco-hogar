import { z } from "zod/v4"

export const NotificationType = z.enum(["info", "warning", "alert"])
export const NotificationStatus = z.enum(["unread", "read"])

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: NotificationType,
  status: NotificationStatus,
  resourceType: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
  eventType: z.string().nullable().optional(),
  createdAt: z.string(),
  readAt: z.string().nullable().optional(),
})

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  readAt: true,
}).extend({
  id: z.string().optional(),
  createdAt: z.string().optional(),
})

export type Notification = z.infer<typeof NotificationSchema>
