# Backend API

API REST en Express + TypeScript con Drizzle ORM y MySQL para la app financiera.

## Requisitos
- Node 18+
- MySQL en `localhost:3306`

## Configuración rápida
```bash
npm install
cp .env.example .env   # Ajusta credenciales de DB y JWT_SECRET
npx drizzle-kit migrate # aplica migraciones
npm run dev             # puerto 3000 por defecto
```

Variables clave en `.env`:
- `DATABASE_URL` (ej: `mysql://un_usr:una_clave@localhost:3306/eco_hogar`)
- `JWT_SECRET`
- Jobs opcionales: `BILL_RENEW_*`, `NOTIFICATION_*`

## Scripts
- `npm run dev` – desarrollo
- `npm run build` – compilar
- `npm start` – producción
- `npm run type-check` – tipos

## Rutas principales
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/session`, `/api/auth/logout`, `/api/auth/captcha`
- Cuentas: `/api/accounts`
- Movimientos: `/api/movements`
- Recibos: `/api/bills`
- Deudas + pagos: `/api/debts`, `/api/debts/:id/payments`
- CDTs: `/api/cdts`
- Notificaciones: `/api/notifications`
- Subidas: `/api/uploads`
- Settings (presupuesto mensual): `/api/settings/budget`

Todas requieren autenticación JWT vía cookie (middleware `requireAuth`), salvo auth y captcha.

## Jobs en segundo plano
- Renovación de recibos (`node-cron`): controla `BILL_RENEW_DISABLED`, `BILL_RENEW_CRON`, `BILL_RENEW_TZ`.
- Notificaciones: controla `NOTIFICATION_DISABLED`, `NOTIFICATION_CRON`, `NOTIFICATION_TZ`, `NOTIFICATION_DUE_SOON_DAYS`.

## Notas
- IDs son UUID v4.
- Decimales como strings en la DB (precision 15, scale 2).
- El servidor expone `GET /health` para ver estado.
