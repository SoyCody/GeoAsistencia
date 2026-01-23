import Router from 'express';
import { entrada, salida, asistencias, atrasos } from '../modules/registro/registro.controller.js';
import { registrarMobile, ultimoRegistro, historialRegistros } from '../modules/registro/registro.controller.mobile.js';
import { auth, isAdmin } from '../middlewares/auth.middleware.js';
import { pool } from '../config/db.js';

const router = Router();

// Existing web routes
router.post('/entrada', auth, entrada);
router.post('/salida', auth, salida);
router.get('/total', auth, isAdmin, asistencias);
router.get('/atrasos', auth, isAdmin, atrasos);

// Mobile routes (new)
router.post('/new', auth, registrarMobile);
router.get('/ultimo', auth, ultimoRegistro);
router.get('/historial', auth, historialRegistros);

// Admin route - Get all registrations
router.get('/all', auth, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ra.id,
                ra.tipo_evento as tipo,
                ra.fecha_hora_servidor,
                ra.nota_auditoria,
                p.codigo_empleado,
                p.nombre_completo,
                g.nombre_zona as geocerca,
                s.nombre as sede
            FROM registro_asistencia ra
            INNER JOIN perfil p ON ra.perfil_id = p.id
            INNER JOIN geocerca g ON ra.geocerca_validada_id = g.id
            INNER JOIN sede s ON g.sede_id = s.id  
            ORDER BY ra.fecha_hora_servidor DESC
            LIMIT 100
        `);

        return res.status(200).json({
            registros: result.rows
        });
    } catch (error) {
        console.error('[/all] Error:', error);
        return res.status(500).json({
            message: 'Error al obtener registros'
        });
    }
});

// Admin route - Get today's attendance statistics  
router.get('/estadisticas', auth, isAdmin, async (req, res) => {
    try {
        console.log('[/estadisticas] Getting today statistics...');

        // Return empty data for now
        return res.status(200).json({
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
        console.error('[/estadisticas] Error:', error);
        return res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});

export default router;