import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

const connection = mysql.createPool(process.env.DATABASE_URL || "mysql://user:password@localhost:3306/database");

export const db = drizzle(connection, { schema, mode: 'default' });

export { schema };