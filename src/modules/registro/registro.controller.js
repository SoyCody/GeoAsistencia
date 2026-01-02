import { pool } from '../../config/db.js';
import {
    verEnSede,
    obtenerGeocerca,
    validarGeocercaAsignada,
    registrarAsistencia,
    actualizarPerfil,
    obtenerAsignacion
} from './registro.repository.js';
import { validateCoordenadas } from './registro.validator.js'

export const entrada = async (req, res) => {
    const { lat, lon } = req.body;
    const perfilId = req.user.id;
    const client = await pool.connect();
    let tipo = 'ENTRADA';
    try {
        await client.query('BEGIN');

        const coordenadas = validateCoordenadas(lat, lon);
        const enSedeResult = await verEnSede(client, perfilId);

        if (!enSedeResult) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'Perfil no encontrado'
            });
        }

        if (enSedeResult.en_sede) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El usuario ya esta dentro de su centro de trabajo'
            })
        }

        const geocercaAsignada = await obtenerGeocerca(client, perfilId);
        if (!geocercaAsignada) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El usuario no tiene geocerca asignada'
            });
        }

        const geocercaValidada = await validarGeocercaAsignada(
            client,
            perfilId,
            coordenadas.latitud,
            coordenadas.longitud
        );

        if (!geocercaValidada) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El usuario no se encuentra dentro de su lugar asignado'
            });
        }

        const asignacion = await obtenerAsignacion(
            client,
            perfilId,
            geocercaAsignada.geocerca_id
        );

        if (!asignacion) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'No existe horario asignado'
            });
        }

        const now = new Date();
        const horaActual = now.toTimeString().slice(0, 5); // "HH:MM"

        let notaAuditoria = 'Entrada registrada';

        if (horaActual > asignacion.hora_entrada) {
            notaAuditoria = 'Atrasado';
        }

        await registrarAsistencia(
            client,
            perfilId,
            geocercaAsignada.geocerca_id,
            tipo,
            coordenadas.latitud,
            coordenadas.longitud,
            true,
            notaAuditoria
        );

        await actualizarPerfil(client, perfilId, true);

        await client.query('COMMIT');
        return res.status(200).json({
            status: 'success',
            message: 'Entrada registrada'
        })

    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK');
        return res.status(400).json({
            message: 'Error en el servidor',
            error: error.message
        })
    } finally{
        client.release();
    }
};

export const salida = async (req, res) => {
    
}