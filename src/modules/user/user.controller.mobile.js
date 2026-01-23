import { pool } from '../../config/db.js';

// Obtener perfil del usuario autenticado
export const getMyProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id; // Del middleware de autenticación

        const result = await client.query(
            `SELECT 
                p.id,
                p.codigo_empleado,
                p.cargo,
                p.es_admin,
                p.estado,
                per.nombre_completo,
                per.email,
                per.telefono
             FROM perfil p
             INNER JOIN persona per ON per.id = p.persona_id
             WHERE p.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];

        // Obtener estadísticas de asistencia
        const statsResult = await client.query(
            `SELECT 
                DATE(fecha_hora_servidor) as fecha,
                tipo_evento
             FROM registro_asistencia
             WHERE perfil_id = $1
               AND fecha_hora_servidor >= NOW() - INTERVAL '30 days'
             ORDER BY fecha_hora_servidor DESC`,
            [userId]
        );

        const diasTrabajados = new Set(
            statsResult.rows.map(r => r.fecha.toISOString().split('T')[0])
        ).size;

        return res.status(200).json({
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            telefono: user.telefono,
            codigo_empleado: user.codigo_empleado,
            cargo: user.cargo,
            rol: user.es_admin ? 'ADMIN' : 'USER',
            estado: user.estado,
            estadisticas: {
                dias_trabajados_mes: diasTrabajados,
                total_registros: statsResult.rows.length
            }
        });

    } catch (error) {
        console.error('Error en getMyProfile:', error);
        return res.status(500).json({
            message: 'Error al obtener perfil'
        });
    } finally {
        client.release();
    }
};
