import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar el .env que está en la misma carpeta que este archivo (src/config/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Normalizar variables (soporta ambos prefijos DB_ y USER_DB / PASSWORD)
const DB_HOST = (process.env.DB_HOST || process.env.HOST || process.env.USER_DB_HOST || '').toString().trim() || undefined;
const DB_PORT = process.env.DB_PORT || process.env.PORT || ''; 
const DB_NAME = (process.env.DB_NAME || process.env.DATABASE || '').toString().trim() || undefined;
const DB_USER = (process.env.DB_USER || process.env.USER_DB || process.env.USER || '').toString().trim() || undefined;
const DB_PASSWORD = (process.env.DB_PASSWORD || process.env.PASSWORD || process.env.PGPASSWORD || '').toString().trim() || undefined;

const DB_PORT_NUM = DB_PORT.toString().trim() === '' ? undefined : Number(DB_PORT.toString().trim());

export const pool = new pg.Pool({
    host: DB_HOST,
    port: DB_PORT_NUM,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
});

// Función para verificar la conexión a la base de datos
export async function verificarConexionBD() {
    try {
        // Ejecuta una consulta simple para validar la conexión
        await pool.query('SELECT 1');
        return { conectada: true, mensaje: 'Base de datos conectada' };
    } catch (error) {
        return { conectada: false, mensaje: `Error de conexión a BD: ${error.message}` };
    }
}


