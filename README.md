# Web Project

Guia rapida para trabajar en local con el frontend (React + Vite) y el backend (Express + MySQL).

## Requisitos

- Node.js 18+ y npm 9+
- MySQL (puedes levantarlo con XAMPP)
- Git (opcional)

## 1. Configurar las variables de entorno

1. Copia los archivos de ejemplo:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   (en PowerShell: `Copy-Item backend\.env.example backend\.env`).
2. Abre `backend/.env` y ajusta:
   - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`: deben apuntar a tu servidor MySQL. Si usas XAMPP deja `localhost`, puerto `3306`, usuario `root` y password vacio (o la que hayas puesto en phpMyAdmin).
   - `DATABASE_URL`: debe reflejar la misma informacion en formato `mysql://user:pass@host:puerto/base`.
   - `PORT`: puerto del API, por defecto `3001`.
   - `CLIENT_URL`: URL desde donde correra el frontend (Vite usa `http://localhost:5173`).
3. Abre `frontend/.env` y deja `VITE_API_URL=http://localhost:3000` (o el puerto que hayas elegido para el backend).
4. Si levantas MySQL con XAMPP:
   - Abre el panel de control y presiona **Start** en MySQL (Apache solo si quieres phpMyAdmin).
   - Verifica que MySQL quede en estado *Running* y que nadie mas use el mismo puerto.
   - Si cambias la contraseña del usuario `root`, actualiza `DATABASE_PASSWORD` y `DATABASE_URL`.

Listo: con eso el backend sabra a que base conectar y el frontend a que API llamar.

## 2. Inicializar la base de datos

1. Asegurate de que MySQL este encendido (si usas XAMPP, revisa que el modulo MySQL siga en *Running*).
2. Instala las dependencias si aun no lo hiciste:
   ```bash
   npm run install:all
   ```
3. Ejecuta el script que crea la base y corre las migraciones de Drizzle:
   ```bash
   npm run init-db
   ```
   (internamente es `npm run init-db --prefix backend`). El script usara los datos de `backend/.env` y mostrara `Base creada y migraciones aplicadas` al terminar.
4. Si agregas nuevas migraciones en el futuro, vuelve a ejecutar `npm run init-db` para aplicarlas.

## 3. Ejecutar el proyecto en modo develop

1. Verifica que la base ya exista (paso anterior) y que el backend puede conectarse.
2. Desde la raiz del repo, levanta frontend y backend en paralelo:
   ```bash
   npm run dev
   ```
   - Frontend disponible en `http://localhost:5173`.
   - Backend disponible en `http://localhost:3001` (o el puerto configurado en `PORT`).
3. Necesitas correr solo uno de los servicios? Puedes usar:
   - `npm run dev:backend` para el API.
   - `npm run dev:frontend` para la interfaz.

Con estos tres pasos tienes: variables configuradas (incluyendo XAMPP), base lista y entorno de desarrollo ejecutandose.
