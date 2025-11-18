import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useQueryFetch } from "@/hooks/use-query-fetch"
import DashboardLayout from "@/layouts/dashboard"
import { SiteHeader } from "@/components/site-header"
import { API_ENDPOINTS } from "@/lib/api-config"
import type { Notification } from "@web-project/types/notifications"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCheck, RefreshCcw, Trash2 } from "lucide-react"
import { ListLoadingSkeleton } from "@/components/loading-skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function NotificationItem({
  notification,
  onMarkRead,
  onDelete
}: {
  notification: Notification
  onMarkRead: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleMarkRead = async () => {
    try {
      setPending(true)
      await onMarkRead(notification.id)
    } finally {
      setPending(false)
    }
  }

  const typeStyles: Record<Notification["type"], string> = {
    info: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    alert: "text-red-600 bg-red-50 dark:bg-red-950/40",
  }

  return (
    <Card className={cn("p-4 space-y-2", notification.status === "unread" ? "border-primary/40 shadow-sm" : "opacity-80")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{notification.title}</span>
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", typeStyles[notification.type])}>
              {notification.type === "info" ? "Info" : notification.type === "warning" ? "Alerta" : "Urgente"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString("es-ES")}</span>
        </div>
        <div className="flex items-center gap-2">
          {notification.status === "unread" && (
            <Button size="sm" variant="outline" onClick={handleMarkRead} disabled={pending}>
              <CheckCheck className="h-4 w-4 mr-1" />
              {pending ? "Marcando..." : "Marcar como leída"}
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              try {
                setDeleting(true)
                await onDelete(notification.id)
              } finally {
                setDeleting(false)
              }
            }}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function NotificationsContent() {
  const queryClient = useQueryClient()
  const { data, refetch, isFetching, isLoading } = useQueryFetch<Notification[]>({
    url: API_ENDPOINTS.notifications,
    queryKey: ['notifications'],
  })

  const updateCache = (updater: (items: Notification[]) => Notification[]) => {
    queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => updater(old))
  }

  const handleMarkRead = async (id: string) => {
    const previous = queryClient.getQueryData<Notification[]>(['notifications'])
    updateCache((items) =>
      items.map((item) => item.id === id ? { ...item, status: "read", readAt: new Date().toISOString() } : item)
    )
    try {
      await fetch(`${API_ENDPOINTS.notifications}/${id}/read`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error(error)
      updateCache(() => previous ?? [])
    }
  }

  const handleMarkAll = async () => {
    const previous = queryClient.getQueryData<Notification[]>(['notifications'])
    updateCache((items) => items.map((item) => ({ ...item, status: "read", readAt: new Date().toISOString() })))
    try {
      await fetch(`${API_ENDPOINTS.notifications}/read-all`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error(error)
      updateCache(() => previous ?? [])
    }
  }

  const handleDelete = async (id: string) => {
    const previous = queryClient.getQueryData<Notification[]>(['notifications'])
    updateCache((items) => items.filter((item) => item.id !== id))
    try {
      await fetch(`${API_ENDPOINTS.notifications}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
    } catch (error) {
      console.error(error)
      updateCache(() => previous ?? [])
    }
  }

  const handleDeleteAll = async () => {
    const previous = queryClient.getQueryData<Notification[]>(['notifications'])
    updateCache(() => [])
    try {
      await fetch(`${API_ENDPOINTS.notifications}`, {
        method: "DELETE",
        credentials: "include",
      })
    } catch (error) {
      console.error(error)
      updateCache(() => previous ?? [])
    }
  }

  if (isLoading) {
    return <ListLoadingSkeleton showHeader count={4} />
  }

  return (
    <section className="space-y-4">
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tus notificaciones</h2>
          <p className="text-sm text-muted-foreground">Revisa o marca como leídas tus últimas alertas.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar todas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar todas las notificaciones?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán todas las notificaciones del usuario actual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {!isFetching && data?.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground text-sm">
          No tienes notificaciones por ahora.
        </Card>
      )}
      <div className="space-y-3">
        {data?.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onMarkRead={handleMarkRead} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  )
}

export default function NotificationsCenter() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <SiteHeader title="Centro de notificaciones" />
        <section className="container mx-auto pt-4 px-4 space-y-4">
          <NotificationsContent />
        </section>
      </div>
    </DashboardLayout>
  )
}
