// Script para crear registros de prueba
import { pool } from './src/config/db.js';

async function crearRegistrosPrueba() {
    const client = await pool.connect();
    try {
        console.log('🔄 Creando registros de prueba para EMP-7708...');

        // Obtener perfil_id y geocerca_id
        const perfilResult = await client.query(
            `SELECT p.id as perfil_id, g.id as geocerca_id, g.nombre_zona
             FROM perfil p
             INNER JOIN asignacion_laboral al ON p.id = al.perfil_id
             INNER JOIN geocerca g ON al.geocerca_id = g.id
             WHERE p.codigo_empleado = 'EMP-7708'
             LIMIT 1`
        );

        if (perfilResult.rows.length === 0) {
            console.error('❌ No se encontró el usuario o no tiene geocerca asignada');
            return;
        }

        const { perfil_id, geocerca_id, nombre_zona } = perfilResult.rows[0];
        console.log(`✅ Usuario encontrado: perfil_id=${perfil_id}, geocerca=${nombre_zona}`);

        // Eliminar registros existentes del día de hoy
        await client.query(`
            DELETE FROM registro_asistencia 
            WHERE perfil_id = $1 
            AND DATE(fecha_hora_servidor) = CURRENT_DATE
        `, [perfil_id]);

        // Crear 3 pares de entrada/salida de días anteriores
        const registros = [
            // Hace 3 días
            { tipo: 'ENTRADA', dias: 3, hora: '08:15:00', nota: 'Entrada registrada desde móvil' },
            { tipo: 'SALIDA', dias: 3, hora: '17:30:00', nota: 'Salida registrada desde móvil' },
            // Hace 2 días
            { tipo: 'ENTRADA', dias: 2, hora: '08:45:00', nota: 'Atrasado' },
            { tipo: 'SALIDA', dias: 2, hora: '18:00:00', nota: 'Horas extra' },
            // Ayer
            { tipo: 'ENTRADA', dias: 1, hora: '08:00:00', nota: 'Entrada registrada desde móvil' },
            { tipo: 'SALIDA', dias: 1, hora: '17:00:00', nota: 'Salida registrada desde móvil' },
        ];

        for (const reg of registros) {
            await client.query(`
                INSERT INTO registro_asistencia (
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
                    $1, $2, $3, -3.987, -79.202,
                    ST_SetSRID(ST_MakePoint(-79.202, -3.987), 4326)::geography,
                    true, $4,
                    CURRENT_DATE - INTERVAL '${reg.dias} days' + TIME '${reg.hora}'
                )
            `, [perfil_id, geocerca_id, reg.tipo, reg.nota]);
            console.log(`✅ Creado: ${reg.tipo} hace ${reg.dias} días a las ${reg.hora}`);
        }

        // Resetear estado a fuera de la sede
        await client.query('UPDATE perfil SET en_sede = false WHERE id = $1', [perfil_id]);

        console.log('✅ Registros de prueba creados exitosamente');
        console.log('ℹ️  Usuario ahora está FUERA de la sede (puede marcar ENTRADA)');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

crearRegistrosPrueba();
