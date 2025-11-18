import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import type { Notification } from "@web-project/types/notifications"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

async function fetchNotifications() {
  const res = await fetch(`${API_ENDPOINTS.notifications}`, { credentials: "include" })
  if (!res.ok) {
    throw new Error("No se pudieron obtener las notificaciones")
  }
  return await res.json() as Notification[]
}

async function markNotificationRead(id: string) {
  const res = await fetch(`${API_ENDPOINTS.notifications}/${id}/read`, {
    method: "POST",
    credentials: "include"
  })
  if (!res.ok) {
    throw new Error("No se pudo marcar como leída")
  }
  return await res.json() as Notification
}

async function markAllNotificationsRead() {
  const res = await fetch(`${API_ENDPOINTS.notifications}/read-all`, {
    method: "POST",
    credentials: "include"
  })
  if (!res.ok && res.status !== 204) {
    throw new Error("No se pudo marcar todas como leídas")
  }
}

const typeStyles: Record<Notification["type"], string> = {
  info: "text-blue-600 bg-blue-100 dark:bg-blue-950/50",
  warning: "text-amber-600 bg-amber-100 dark:bg-amber-950/50",
  alert: "text-red-600 bg-red-100 dark:bg-red-950/50",
}

const statusDot = {
  unread: "bg-primary",
  read: "bg-muted-foreground/40",
}

function formatDate(value: string) {
  const date = new Date(value)
  return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })
}

/** Menú desplegable que muestra y marca notificaciones in-app. */
export function NotificationMenu() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 1000 * 60 * 2,
  })

  const unreadCount = data?.filter((item) => item.status === "unread").length ?? 0

  const markOneMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between text-sm font-semibold">
          Notificaciones
          {data && data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3 w-3" />
              {markAllMutation.isPending ? "Procesando..." : "Marcar todas"}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto">
          {(!data || data.length === 0) && (
            <div className="p-4 text-sm text-muted-foreground">
              No tienes notificaciones por ahora.
            </div>
          )}
          {data?.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex flex-col gap-1 border-b px-3 py-2 last:border-0",
                notification.status === "unread" ? "bg-muted/50" : ""
              )}
            >
              <div className="flex items-start gap-2">
                <span className={cn("mt-1 h-2 w-2 rounded-full", statusDot[notification.status])} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{notification.title}</span>
                    <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold", typeStyles[notification.type])}>
                      {notification.type === "info" ? "Info" : notification.type === "warning" ? "Alerta" : "Urgente"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(notification.createdAt)}</p>
                </div>
              </div>
              {notification.status === "unread" && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => markOneMutation.mutate(notification.id)}
                    disabled={markOneMutation.isPending}
                  >
                    Marcar como leída
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
