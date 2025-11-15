# Backend API - Web Project

Backend Express con TypeScript, Drizzle ORM y MySQL para gestión financiera.

## Stack Tecnológico

- **Runtime**: Node.js con TypeScript
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Base de datos**: MySQL
- **Validación**: Zod (via drizzle-zod)
- **Tipos compartidos**: @web-project/types

## Estructura del Proyecto

```
backend/
├── src/
│   ├── db/
│   │   ├── index.ts          # Configuración de Drizzle
│   │   └── schema.ts         # Schemas de base de datos
│   ├── routes/
│   │   ├── accounts.ts       # Rutas de cuentas
│   │   ├── bills.ts          # Rutas de recibos
│   │   ├── cdts.ts           # Rutas de CDTs
│   │   ├── debts.ts          # Rutas de deudas
│   │   └── movements.ts      # Rutas de movimientos
│   └── index.ts              # Servidor Express
├── drizzle/                  # Migraciones (generado)
├── drizzle.config.ts         # Configuración de Drizzle Kit
├── .env.example              # Variables de entorno ejemplo
└── package.json
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tu configuración de MySQL
```

3. Generar migraciones:
```bash
npx drizzle-kit generate
```

4. Aplicar migraciones:
```bash
npx drizzle-kit migrate
```

## Scripts Disponibles

- `npm run dev` - Modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor en producción
- `npm run type-check` - Verificar tipos TypeScript

## API Endpoints

### Accounts (Cuentas)
- `GET /api/accounts` - Listar todas las cuentas
- `GET /api/accounts/:id` - Obtener cuenta por ID
- `POST /api/accounts` - Crear nueva cuenta
- `PUT /api/accounts/:id` - Actualizar cuenta
- `DELETE /api/accounts/:id` - Eliminar cuenta

### Movements (Movimientos)
- `GET /api/movements` - Listar todos los movimientos
- `GET /api/movements/:id` - Obtener movimiento por ID
- `POST /api/movements` - Crear nuevo movimiento
- `PUT /api/movements/:id` - Actualizar movimiento
- `DELETE /api/movements/:id` - Eliminar movimiento

### Bills (Recibos/Servicios)
- `GET /api/bills` - Listar todos los recibos
- `GET /api/bills/:id` - Obtener recibo por ID
- `POST /api/bills` - Crear nuevo recibo
- `PUT /api/bills/:id` - Actualizar recibo
- `DELETE /api/bills/:id` - Eliminar recibo

### Debts (Deudas/Préstamos)
- `GET /api/debts` - Listar todas las deudas
- `GET /api/debts/:id` - Obtener deuda por ID
- `GET /api/debts/:id/payments` - Obtener tabla de amortización
- `PUT /api/debts/:id/payments/:paymentId` - Marcar pago como realizado
- `POST /api/debts` - Crear nueva deuda (genera tabla de amortización automáticamente)
- `PUT /api/debts/:id` - Actualizar deuda
- `DELETE /api/debts/:id` - Eliminar deuda y sus pagos

### CDTs (Certificados de Depósito a Término)
- `GET /api/cdts` - Listar todos los CDTs
- `GET /api/cdts/:id` - Obtener CDT por ID
- `POST /api/cdts` - Crear nuevo CDT (calcula automáticamente monto final e intereses)
- `PUT /api/cdts/:id` - Actualizar CDT
- `DELETE /api/cdts/:id` - Eliminar CDT

## Características Especiales

### Tabla de Amortización Automática
Al crear una deuda, el sistema genera automáticamente la tabla de amortización con el método francés (cuotas fijas).

### Cálculo Automático de CDTs
Al crear un CDT, el sistema calcula automáticamente:
- Fecha de vencimiento basada en el plazo
- Monto final con interés compuesto diario

### Conversión de Tags en Movements
Los tags se almacenan como JSON string en la base de datos pero se devuelven como arrays en las respuestas.

### Renovación automática de recibos
Un job en segundo plano (implementado con `node-cron`) revisa diariamente los recibos con `autoRenew = true`, estado `pagado` y fecha de vencimiento pasada. Por cada coincidencia se crea un nuevo recibo con el ciclo correspondiente y el registro anterior se conserva como histórico (su `autoRenew` se desactiva para evitar duplicados). Variables de entorno disponibles:

- `BILL_RENEW_DISABLED`: si es `true`, no se programa el job (útil para entornos de prueba).
- `BILL_RENEW_CRON`: expresión CRON usada para la ejecución. Por defecto `0 3 * * *` (03:00 todos los días).
- `BILL_RENEW_TZ`: zona horaria a usar para el CRON (por ejemplo `America/Bogota`). Si no se establece, se usa el timezone del sistema.
- `ENABLE_DEV_ENDPOINTS`: cuando es `true`, habilita `/api/dev/bill-renewal` para disparar el job manualmente (solo recomendado para entornos locales).

Al iniciar el servidor se ejecuta una pasada inmediata y el cron se mantiene corriendo con la configuración indicada.

### Endpoints de desarrollo
Con `ENABLE_DEV_ENDPOINTS=true`, se expone `POST /api/dev/bill-renewal` para ejecutar manualmente el job de renovación. Se puede enviar opcionalmente `{"referenceDate": "2025-01-01T00:00:00.000Z"}` en el body para forzar la fecha de corte.

### Notificaciones in-app
Cada usuario cuenta con un centro de notificaciones. Un job diario revisa recibos vencidos o próximos a vencer y genera alertas locales (sin correos todavía). Variables:

- `NOTIFICATION_DISABLED`: desactiva por completo el job.
- `NOTIFICATION_CRON`: expresión CRON para ejecutar el generador (por defecto `0 8 * * *`).
- `NOTIFICATION_TZ`: zona horaria opcional para el cron.
- `NOTIFICATION_DUE_SOON_DAYS`: cantidad de días antes del vencimiento para disparar la alerta (“próximo a vencer”).

El endpoint `/api/notifications` devuelve las notificaciones actuales; `/api/notifications/:id/read` y `/api/notifications/read-all` permiten marcarlas como leídas.

## Base de Datos

### Tablas

1. **accounts** - Cuentas bancarias con soporte multi-moneda
2. **movements** - Movimientos de ingresos y egresos
3. **bills** - Recibos y servicios recurrentes
4. **debts** - Deudas y préstamos
5. **payments** - Tabla de amortización de deudas
6. **cdts** - Certificados de depósito a término

### Relaciones

- `debts` → `payments` (1:N)

## Tipos Compartidos

El backend usa los tipos del paquete `@web-project/types` que están sincronizados con el frontend. Los schemas de Drizzle están mapeados a estos tipos usando `drizzle-zod`.

## Desarrollo

El servidor corre por defecto en `http://localhost:3001`

Health check disponible en: `http://localhost:3001/health`

## Notas

- El servidor usa CORS habilitado para desarrollo
- Todos los IDs son UUIDs v4
- Las fechas se manejan como ISO strings
- Los decimales tienen precisión de 15 dígitos y 2 decimales
