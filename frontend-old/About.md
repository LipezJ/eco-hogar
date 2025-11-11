<div style="height: 1000px;display: flex;flex-direction: column;justify-content: space-between;">

  <h1 align="center">EcoHogar</h1>

<div>
  <h3 align="center">Integrantes</h3>

<p align="center">
  ANDERSON NICOLAS DÍAZ CAMACHO<br>
  2214105<br>
  Lider del Grupo
</p>
<p align="center">
  JUAN DAVID LIPEZ GUEVARA<br>
  2223102
</p>
<p align="center">
  DAVID FERNANDO MUÑOZ ORTIZ<br>
  2234504
</p>
<p align="center">
  RANCES ALEJANDRO RAMÍREZ MORILLO<br>
  2234514
</p>
</div>

<div>
  <h3 align="center">Profesor encargado</h3>

<p align="center">
  MANUEL GUILLERMO FLOREZ BECERRA
</p>
</div>
<p  align="center">
  Facultad de Ingeniería de Sistemas<br>
Codigo asignatura: 22967<br>
Universidad Industrial de Santander<br>
</p>
</div>

### Objetivo General:

Diseñar e implementar una aplicación web que permita registrar, organizar y analizar las finanzas del hogar
(ingresos, egresos, deudas y recibos), facilitando el control del presupuesto, la toma de decisiones y el
cumplimiento de metas de ahorro.

### Objetivos Especifíco:

1. Desarrollar un módulo de registro de movimientos (ingresos/egresos) con categorización, etiquetas
y adjuntos.
2. Implementar un gestor de deudas/préstamos con calendario de pagos, intereses y recordatorios.
3. Crear un gestor de recibos/servicios (agua, luz, gas, internet, etc.) con vencimientos, estados y
almacenamiento de comprobantes.
4. Incorporar reportes y visualizaciones (tablas y gráficos) de flujo de caja, balance por categoría y
proyección mensual..
5. Añadir alertas (correo/notificación del navegador) ante vencimientos y sobrepaso de presupuesto.

## Imagen – Copia de la primera página (Fase I)

![Portada del sitio (demo)](https://raw.githubusercontent.com/LipezJ/eco-hogar/refs/heads/main/public/img/dashboard.png)

Nota: la imagen es de referencia de la UI. Para un PDF, se recomienda insertar una captura actual del sitio en ejecución en `http://localhost:3000`.

## Estructura del sitio en disco (carpetas y significado)

```
.
├─ public/
│  └─ img/              # Recursos estáticos (imágenes)
│     ├─ dashboard.png
│     ├─ team-ana.svg
│     └─ team-carlos.svg
├─ src/
│  ├─ app/              # App Router de Next.js (páginas y layouts)
│  │  ├─ page.tsx       # Landing (pública) + secciones (features, pricing, FAQ)
│  │  ├─ login/         # Página de login
│  │  ├─ register/      # Página de registro
│  │  ├─ contactenos/   # Página de “Contáctenos” + equipo
│  │  └─ dashboard/     # Rutas privadas (Home del dashboard y secciones)
│  ├─ components/       # Componentes de UI y de dominio
│  │  ├─ layout/        # Layouts y cabeceras reutilizables
│  │  │  └─ marketing-header.tsx
│  │  ├─ ui/            # Biblioteca shadcn/Radix (dialog, dropdown, popover, accordion, etc.)
│  │  ├─ reports/       # Componentes de reportes
│  │  ├─ stats/         # Resúmenes/estadísticas
│  │  ├─ login-form.tsx # Formulario de inicio de sesión
│  │  └─ faq-accordion.tsx # Acordeón de Preguntas Frecuentes
│  ├─ lib/              # Lógica de negocio/utilidades
│  │  ├─ auth.ts        # Usuarios en memoria y verificación
│  │  ├─ actions/       # Server Actions (auth-actions.ts)
│  │  ├─ auth-context.tsx # Contexto de sesión en cliente
│  │  └─ utils.ts       # Utilidades varias
│  ├─ hooks/            # Hooks reutilizables
│  └─ types/            # Tipos TypeScript (dominio)
├─ next.config.ts       # Configuración de Next (incluye botid)
├─ README.txt           # Guía paso a paso (local y nube)
└─ package.json
```

Explicación breve
- `public/`: archivos estáticos servidos desde la raíz (`/img/...`).
- `src/app/`: rutas, páginas y layouts de Next.js (App Router). Cada subcarpeta es una ruta.
- `src/components/`: componentes reutilizables (UI shadcn, headers, formularios, tablas, etc.).
- `src/lib/`: lógica de autenticación, server actions y utilidades.
- `src/hooks/`: hooks de React para estados/patrones comunes.
- `src/types/`: tipos de dominio (movements, debts, bills, cdts).

## Funcionalidades implementadas (menús y submenús)

Navegación pública
- Header (marketing-header):
  - Enlaces a secciones de la landing: Características (`#features`), Beneficios (`#benefits`), Precios (`#pricing`), Preguntas frecuentes (`#faq`).
  - Enlaces a rutas: Iniciar sesión (`/login`), Registrate (`/register`), Contáctenos (`/contactenos`).
  - Menú móvil con los mismos accesos.
- Landing (`/`):
  - Secciones: Hero, Features, Benefits, Pricing, FAQ (acordeón), CTA.

Autenticación (simulada)
- Login y registro sin BD usando usuarios en memoria (`admin/admin123`, `usuario/usuario123`).
- Sesión con JWT en cookie (server action `auth-actions.ts`).

Rutas privadas (Dashboard)
- Acceso sólo con sesión (protección por proxy/middleware de Next a nivel de App Router en esta base de código).
- Secciones del dashboard (UI demo): movimientos, deudas, recibos, CDTs; con tablas, filtros y reportes.

Componentes UI (shadcn/Radix)
- Modal/Dialog, Dropdown, Popover.
- Accordion (FAQ) en la landing.

## Características adicionales (conforme a la Nota)

- Sustitución creativa de Bootstrap por shadcn/Radix + Tailwind
  - Componentes equivalentes (Dialog, Dropdown, Popover, Accordion) generados con shadcn; estilos con Tailwind. Ver `src/components/ui/*`.
- Protección anti‑bots (alternativa a Captcha)
  - Integración de BotId para validar acciones sensibles en servidor: `src/instrumentation-client.ts`, `src/lib/actions/auth-actions.ts`.
- Header de marketing reutilizable
  - Un único encabezado para páginas públicas (landing y contáctenos): `src/components/layout/marketing-header.tsx`.
- Persistencia de datos de consultas (mejor UX offline/recargas)
  - TanStack Query + persistencia en `localStorage`: `src/components/tanstack-provider.tsx`.
- Indicador de carga global
  - Barra superior de progreso durante navegación/acciones: `nextjs-toploader` en `src/app/login/page.tsx`.
- Tema claro/oscuro
  - Soporte de temas con `ThemeProvider` y `ThemeToggle`: `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`.
- Accesibilidad y semántica
  - Componentes Radix con atributos ARIA; foco visible y transiciones discretas.
- Seguridad de sesión
  - JWT firmado con `jose` y cookie `httpOnly`, `sameSite`, `secure` en producción: `src/lib/actions/auth-actions.ts`.
- Protección de rutas con el estándar actual de Next
  - Proxy/Matcher para redirigir a login cuando no hay sesión: `src/proxy.ts`.
- Navegación interna del dashboard mejorada
  - Sidebar colapsable y responsive: `src/components/ui/sidebar.tsx`.

## Principios web aplicados en el diseño
- Responsive Design: Tailwind con breakpoints (móvil, tablet, desktop).
- Accesibilidad: roles y atributos ARIA de Radix/shadcn; contraste y foco visibles.
- Consistencia visual: tipografía, espaciados y color por tema; navegación sticky.
- Feedback y movimiento: transiciones “fade/zoom” discretas en overlays; estados de carga.
- Jerarquía y legibilidad: títulos claros, secciones y componentes con semántica apropiada.

## Bibliografía
- Next.js App Router – https://nextjs.org/docs
- Tailwind CSS – https://tailwindcss.com
- shadcn/ui – https://ui.shadcn.com
- Radix UI – https://www.radix-ui.com
- TanStack Query – https://tanstack.com/query
- jose (JWT) – https://github.com/panva/jose
- bcryptjs – https://github.com/dcodeIO/bcrypt.js
- Lucide Icons – https://lucide.dev

## Conclusiones
La Fase I cumple con los objetivos de navegación, simulación de login, estructura modular y uso de componentes modernos. Quedan elementos opcionales para una Fase II: carrusel, multimedia (audio/video), estilos avanzados de tipografía (primera letra), e integración real a BD.

## ANEXO 1 (Principios de diseño empleados)
- Diseño responsivo móvil-first, grillas adaptables.
- Navegación fija (sticky) y accesible.
- Contraste y escala tipográfica para legibilidad.
- Componentes con estados (hover, focus, loading) consistentes.
- Separación de responsabilidades y componentes reutilizables.

## ANEXO 2 (Implementado vs. Pendiente)

Implementado
- Header/menú fijo con navegación pública, menú móvil.
- Rutas públicas/privadas con verificación de sesión en server actions y proxy de protección.
- Login/Registro con usuarios en memoria y cookie JWT.
- Componentes UI: modal/dialog, dropdown, popover, acordeón (FAQ en landing).
- Página “Contáctenos” con equipo y detalles.

Pendiente o reemplazado (justificación según Nota)
- Carrusel (Carousel)
Reemplazado por Accordion (FAQ) en Fase I para priorizar claridad de contenido y rendimiento. El acordeón es suficiente para presentar información expandible y cumple con el objetivo de “collapse”. El carrusel se programará en la siguiente fase si agrega valor real a la landing.
- Multimedia (video y audio)
Omitidos en esta fase por no ser críticos al objetivo funcional (gestión financiera) y para mantener el peso de la página bajo. Se reemplazó por contenido visual estático (capturas) y se deja previsto para Fase II si se requiere onboarding audiovisual.
- Estilo tipográfico “primera letra grande y a color” (::first-letter)
Considerado decorativo. Se priorizó jerarquía tipográfica con escalas de títulos y contraste de color global. Puede añadirse fácilmente en CSS en Fase II sin afectar la arquitectura.
- Formularios y modal de Bootstrap
Sustituidos por shadcn/Radix + Tailwind (permitido por la Nota). Beneficios: accesibilidad mejorada (Radix/ARIA), menor acoplamiento, consistencia visual con el resto de componentes y menor huella de dependencias. Evidencia: `src/components/ui/form.tsx`, `src/components/login-form.tsx`, `src/components/ui/dialog.tsx`.
- Captcha
Reemplazado por protección anti‑bots (BotId) en server actions, manteniendo la intención de evitar automatizaciones maliciosas sin fricción extra para el usuario. Evidencia: `src/instrumentation-client.ts`, `src/lib/actions/auth-actions.ts`.
- Redes sociales en el footer
En Fase I se priorizó un canal de contacto directo y verificable mediante la página `Contáctenos` (equivalente funcional para comunicación). Las redes sociales podrán integrarse en la Fase II según lineamientos del proyecto.

Pendiente o opcional para próximas fases
- Carrusel (no implementado en Fase I).
- Multimedia (video/audio) y estilo de “primera letra” decorativa.

## Requisitos del Plan

Esta sección recoge lo solicitado y lo mapea a cómo se implementó o cómo se puede implementar con la base actual.

### b) Funcionalidades a implementar
1. Autenticación básica (registro/ingreso, persistencia local de sesión)
   - Se pudo implementar: sí. Registro/ingreso con server actions y cookie JWT (`src/lib/actions/auth-actions.ts`), usuarios en memoria (`src/lib/auth.ts`).
2. CAPTCHA (reCAPTCHA v2/hCaptcha o CAPTCHA propio)
   - Se pudo implementar: sí, mediante BotId como alternativa aceptada por la Nota (`src/instrumentation-client.ts`, `src/lib/actions/auth-actions.ts`). Integración de reCAPTCHA/hCaptcha es viable.
3. Gestión de Movimientos (CRUD: ingresos/egresos, categorías, etiquetas, adjunto)
   - Se pudo implementar: parcial. Tipos y formularios de UI listos (`src/types/movements.ts`, `src/app/dashboard/movements/*`). Persistencia/adjuntos binarios quedan para Fase II.
4. Gestor de Deudas/Préstamos (cálculos, pagos, alertas)
   - Se pudo implementar: parcial. Cálculos y tabla de amortización (`src/types/debts.ts`) y UI en dashboard. Alertas quedan para Fase II.
5. Gestor de Recibos/Servicios
   - Se pudo implementar: parcial. Tipos (`src/types/bills.ts`) y UI/reportes; recordatorios/comprobantes persistentes para Fase II.
6. Reportes y Dashboards (KPIs, gráficos, top 5)
   - Se pudo implementar: sí. `src/components/stats/*`, `src/components/reports/*` con `recharts`.
7. Presupuesto por Categoría (tope y alertas)
   - Se pudo implementar: planificado. Arquitectura lista; falta UI/reglas de alerta.
8. Exportar/Importar (CSV/JSON)
   - Se pudo implementar: planificado. Dependencia `exceljs` disponible; pendiente wiring desde tablas.
9. Notificaciones (Web Notifications / correo)
   - Se pudo implementar: planificado. Web Notifications viable; correo requiere backend posterior.

### c) Datos a almacenar (modelo)
- Se pudo implementar: modelado en TS/Zod (`src/types/*`).
  - Usuario: `src/lib/auth.ts` (id, username, name). Email/contraseña persistente: Fase II.
  - Movimiento: `src/types/movements.ts` (tipo, categoría, etiquetas, adjunto opcional, fechas, montos).
  - Deuda/PagoDeuda: `src/types/debts.ts` (tasa, cuotas, pagos, intereses, fechas, saldo proyectado).
  - Recibo: `src/types/bills.ts` (proveedor, ciclo, monto, vencimiento, estado).
  - Presupuesto: pendiente de modelar.

### d) Registro con validación de contraseña y CAPTCHA (obligatorio)
- Se pudo implementar: 
  - Validación de contraseña en cliente: base lista; agregar reglas de fortaleza y barra en `src/components/register-form.tsx`.
  - CAPTCHA: cubierto con BotId (alternativa académica). Integración de reCAPTCHA/hCaptcha se puede activar en Fase II.
  - Buenas prácticas: límite de intentos/bloqueo temporal via server actions; mensajes claros ya presentes.

