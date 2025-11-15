import cron from 'node-cron';
import { processNotifications } from '../services/notifications.js';

const DEFAULT_CRON = '0 8 * * *'; // 08:00 todos los días

export function startNotificationJob() {
  if (process.env.NOTIFICATION_DISABLED === 'true') {
    console.log('[Notifications] Job deshabilitado por NOTIFICATION_DISABLED=true');
    return;
  }

  const cronExpression = process.env.NOTIFICATION_CRON ?? DEFAULT_CRON;
  const timezone = process.env.NOTIFICATION_TZ;

  if (!cron.validate(cronExpression)) {
    console.error(`[Notifications] Expresión CRON inválida: "${cronExpression}". Usa NOTIFICATION_CRON para ajustarla.`);
    return;
  }

  cron.schedule(
    cronExpression,
    async () => {
      try {
        const summary = await processNotifications();
        console.log(`[Notifications] Job ejecutado. Nuevas notificaciones: ${summary.created}`);
      } catch (error) {
        console.error('[Notifications] Error durante la ejecución programada:', error);
      }
    },
    timezone ? { timezone } : undefined
  );

  processNotifications()
    .then((summary) => console.log(`[Notifications] Ejecución inicial completada. Nuevas notificaciones: ${summary.created}`))
    .catch((error) => console.error('[Notifications] Error en la ejecución inicial:', error));

  console.log(`[Notifications] Scheduler iniciado con CRON "${cronExpression}"${timezone ? ` (TZ: ${timezone})` : ''}`);
}
