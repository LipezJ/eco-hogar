/**
 * Configuración de conexión a la base de datos MySQL usando Drizzle.
 */
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

const connection = mysql.createPool(process.env.DATABASE_URL || "mysql://un_usr:una_clave@localhost:3306/eco_hogar");

// Instancia de Drizzle con los esquemas tipados
export const db = drizzle(connection, { schema, mode: 'default' });

export { schema };
