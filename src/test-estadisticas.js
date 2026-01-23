// Test endpoint
import { pool } from '../config/db.js';

export async function testEstadisticas(req, res) {
    try {
        console.log('Testing estadisticas endpoint...');

        // Test simple query
        const result = await pool.query('SELECT NOW() as current_time');
        console.log('Simple query result:', result.rows);

        return res.status(200).json({
            test: 'OK',
            time: result.rows[0].current_time,
            usuariosDentro: [],
            usuariosFuera: [],
            usuariosATiempo: [],
            usuariosAtrasados: [],
            conteo: {
                dentro: 0,
                fuera: 0,
                aTiempo: 0,
                atrasados: 0
            }
        });
    } catch (error) {
        console.error('Test error:', error);
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
}
