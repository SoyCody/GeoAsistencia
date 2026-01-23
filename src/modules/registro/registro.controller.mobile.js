import { pool } from '../../config/db.js';

// Registrar entrada o salida desde móvil
export const registrarMobile = async (req, res) => {
    const client = await pool.connect();
    try {
        const perfilId = req.user.id;
        const { tipo, latitud, longitud } = req.body;

        console.log('🔍 [registrarMobile] Datos recibidos:', {
            perfilId,
            tipo,
            latitud,
            longitud,
            headers: {
                'x-app-source': req.headers['x-app-source'],
                authorization: req.headers.authorization ? 'Bearer ***' : 'no token'
            }
        });

        if (!tipo || !latitud || !longitud) {
            console.error('❌ [registrarMobile] Validación fallida - campos faltantes:', {
                tipo: !!tipo,
                latitud: !!latitud,
                longitud: !!longitud
            });
            return res.status(400).json({
                message: 'Tipo, latitud y longitud son requeridos',
                detalles: {
                    tipo: !!tipo,
                    latitud: !!latitud,
                    longitud: !!longitud
                }
            });
        }

        if (tipo !== 'ENTRADA' && tipo !== 'SALIDA') {
            console.error('❌ [registrarMobile] Tipo inválido:', tipo);
            return res.status(400).json({
                message: 'Tipo debe ser ENTRADA o SALIDA'
            });
        }

        await client.query('BEGIN');

        // Verificar estado del perfil
        const perfilResult = await client.query(
            'SELECT en_sede FROM perfil WHERE id = $1',
            [perfilId]
        );

        if (perfilResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'Perfil no encontrado'
            });
        }

        const { en_sede } = perfilResult.rows[0];

        // Validar lógica de entrada/salida
        if (tipo === 'ENTRADA' && en_sede) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Ya tienes una entrada activa sin salida'
            });
        }

        if (tipo === 'SALIDA' && !en_sede) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'No tienes una entrada registrada'
            });
        }

        // Validar que el usuario esté dentro de alguna de sus geocercas asignadas
        const geocercaResult = await client.query(
            `SELECT 
                g.id,
                g.nombre_zona,
                g.radio_metros,
                ST_Distance(
                    g.punto_central,
                    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
                ) as distancia
            FROM asignacion_laboral al
            INNER JOIN geocerca g ON al.geocerca_id = g.id
            WHERE al.perfil_id = $3
            AND ST_DWithin(
                g.punto_central,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                g.radio_metros
            )
            ORDER BY distancia ASC
            LIMIT 1`,
            [latitud, longitud, perfilId]
        );

        if (geocercaResult.rows.length === 0) {
            await client.query('ROLLBACK');
            console.warn('⚠️ [registrarMobile] Usuario fuera de geocercas asignadas:', {
                perfilId,
                ubicacion: { latitud, longitud }
            });
            return res.status(403).json({
                message: 'No estás dentro de ninguna geocerca asignada',
                detalles: 'Asegúrate de estar dentro del área de trabajo autorizada. Si crees que esto es un error, contacta con el administrador.'
            });
        }

        const geocerca = geocercaResult.rows[0];

        // Si es ENTRADA, validar si está atrasado o a tiempo
        let notaAuditoria = `${tipo} registrada desde móvil`;
        if (tipo === 'ENTRADA') {
            // Obtener asignación laboral para validar horario
            const asignacionResult = await client.query(
                `SELECT hora_entrada, hora_salida
                FROM asignacion_laboral
                WHERE perfil_id = $1 AND geocerca_id = $2
                LIMIT 1`,
                [perfilId, geocerca.id]
            );

            if (asignacionResult.rows.length > 0) {
                const asignacion = asignacionResult.rows[0];
                const now = new Date();
                const horaActual = now.toTimeString().slice(0, 5); // "HH:MM"

                if (asignacion.hora_entrada && horaActual > asignacion.hora_entrada) {
                    notaAuditoria = 'Atrasado';
                } else {
                    notaAuditoria = 'Entrada registrada desde móvil';
                }
            }
        }

        // Registrar asistencia
        const registroResult = await client.query(
            `INSERT INTO registro_asistencia (
                perfil_id,
                geocerca_validada_id,
                tipo_evento,
                latitud_movil,
                longitud_movil,
                ubicacion_movil,
                es_valido,
                nota_auditoria,
                fecha_hora_servidor
            ) VALUES (
                $1, $2, $3, $4::numeric, $5::numeric,
                ST_SetSRID(ST_MakePoint($5::numeric, $4::numeric), 4326)::geography,
                true,
                $6,
                NOW()
            )
            RETURNING id, fecha_hora_servidor`,
            [
                perfilId,
                geocerca.id,
                tipo,
                latitud,
                longitud,
                notaAuditoria
            ]
        );

        // Actualizar estado del perfil
        await client.query(
            'UPDATE perfil SET en_sede = $1 WHERE id = $2',
            [tipo === 'ENTRADA', perfilId]
        );

        await client.query('COMMIT');

        const registroData = {
            id: registroResult.rows[0].id,
            tipo,
            fecha_hora_servidor: registroResult.rows[0].fecha_hora_servidor,
            geocerca_validada_nombre: geocerca.nombre_zona,
            es_valido: true,
            distancia_metros: Math.round(geocerca.distancia),
            nota_auditoria: notaAuditoria
        };

        console.log(`[registrarMobile] ${tipo} registrada exitosamente:`, registroData);

        return res.status(200).json({
            success: true,
            message: `${tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada exitosamente`,
            registro: registroData
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en registrarMobile:', error);
        return res.status(500).json({
            message: 'Error al procesar el registro',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Obtener último registro del día
export const ultimoRegistro = async (req, res) => {
    const client = await pool.connect();
    try {
        const perfilId = req.user.id;

        console.log(`[ultimoRegistro] Buscando último registro para perfil: ${perfilId}`);

        // Obtener el estado actual del perfil
        const perfilResult = await client.query(
            'SELECT en_sede FROM perfil WHERE id = $1',
            [perfilId]
        );

        const enSede = perfilResult.rows[0]?.en_sede || false;

        // Obtener el último registro del día
        const result = await client.query(
            `SELECT 
                ra.id,
                ra.tipo_evento as tipo,
                ra.fecha_hora_servidor,
                g.nombre_zona as geocerca_validada_nombre,
                ra.es_valido
            FROM registro_asistencia ra
            INNER JOIN geocerca g ON ra.geocerca_validada_id = g.id
            WHERE ra.perfil_id = $1
              AND DATE(ra.fecha_hora_servidor) = CURRENT_DATE
            ORDER BY ra.fecha_hora_servidor DESC
            LIMIT 1`,
            [perfilId]
        );

        const ultimo = result.rows.length > 0 ? result.rows[0] : null;
        console.log(`[ultimoRegistro] Último registro:`, ultimo);
        console.log(`[ultimoRegistro] Estado en_sede:`, enSede);

        return res.status(200).json({
            ultimo,
            enSede  // Agregar el estado actual para la UI
        });

    } catch (error) {
        console.error('[ultimoRegistro] Error:', error);
        return res.status(500).json({
            message: 'Error al obtener último registro'
        });
    } finally {
        client.release();
    }
};

// Obtener historial de registros
export const historialRegistros = async (req, res) => {
    const client = await pool.connect();
    try {
        const perfilId = req.user.id;
        const dias = parseInt(req.query.dias || '7');

        const result = await client.query(
            `SELECT 
                ra.id,
                ra.tipo_evento as tipo,
                ra.fecha_hora_servidor,
                g.nombre_zona as geocerca_validada_nombre,
                ra.es_valido
            FROM registro_asistencia ra
            INNER JOIN geocerca g ON ra.geocerca_validada_id = g.id
            WHERE ra.perfil_id = $1
              AND ra.fecha_hora_servidor >= NOW() - INTERVAL '${dias} days'
            ORDER BY ra.fecha_hora_servidor DESC
            LIMIT 50`,
            [perfilId]
        );

        return res.status(200).json({
            registros: result.rows
        });

    } catch (error) {
        console.error('Error en historialRegistros:', error);
        return res.status(500).json({
            message: 'Error al obtener historial'
        });
    } finally {
        client.release();
    }
};
