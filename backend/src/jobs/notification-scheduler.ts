/**
 * Scheduler para generar y enviar notificaciones recurrentes.
 */
import cron from 'node-cron';
import { processNotifications } from '../services/notifications.js';

const DEFAULT_CRON = '0 8 * * *'; // 08:00 todos los dias

/**
 * Inicia el job de notificaciones programadas.
 * Respeta variables de entorno para deshabilitar o ajustar CRON/TZ.
 */
export function startNotificationJob() {
  if (process.env.NOTIFICATION_DISABLED === 'true') {
    console.log('[Notifications] Job deshabilitado por NOTIFICATION_DISABLED=true');
    return;
  }

  const cronExpression = process.env.NOTIFICATION_CRON ?? DEFAULT_CRON;
  const timezone = process.env.NOTIFICATION_TZ;

  if (!cron.validate(cronExpression)) {
    console.error(`[Notifications] Expresion CRON invalida: "${cronExpression}". Usa NOTIFICATION_CRON para ajustarla.`);
    return;
  }

  cron.schedule(
    cronExpression,
    async () => {
      try {
        const summary = await processNotifications();
        console.log(`[Notifications] Job ejecutado. Nuevas notificaciones: ${summary.created}`);
      } catch (error) {
        console.error('[Notifications] Error durante la ejecucion programada:', error);
      }
    },
    timezone ? { timezone } : undefined
  );

  // Ejecucion inicial al levantar el servidor
  processNotifications()
    .then((summary) => console.log(`[Notifications] Ejecucion inicial completada. Nuevas notificaciones: ${summary.created}`))
    .catch((error) => console.error('[Notifications] Error en la ejecucion inicial:', error));

  console.log(`[Notifications] Scheduler iniciado con CRON "${cronExpression}"${timezone ? ` (TZ: ${timezone})` : ''}`);
}
