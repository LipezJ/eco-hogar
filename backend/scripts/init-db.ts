// scripts/init-db.ts
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

import * as schema from '../src/db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

async function main() {
  const dbName = process.env.DATABASE_NAME || 'database';

  // 1. Conexión "root" sin base concreta (o apuntando a `mysql`)
  const root = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  });

  // 2. Crear base si no existe
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await root.end();

  // 3. Conectarse ya a esa base
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: dbName,
  });

  const db = drizzle(pool, { schema, mode: "default" }); // schema opcional

  // 4. Correr migraciones (equivalente a tener la DB al día)
  await migrate(db, {
    migrationsFolder: join(__dirname, '../drizzle'),
  });

  await pool.end();
  console.log('Base creada y migraciones aplicadas ✅');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
