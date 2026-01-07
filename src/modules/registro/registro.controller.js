import { pool } from '../../config/db.js';
import {
    verEnSede,
    obtenerGeocerca,
    validarGeocercaAsignada,
    registrarAsistencia,
    actualizarPerfil,
    obtenerAsignacion,
    countAsistencias,
    countAtrasos
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
    const { lat, lon } = req.body;
    const perfilId = req.user.id;
    let tipo = 'SALIDA';
    const client = await pool.connect();
    try{
        client.query('BEGIN');

        const coordenadas = validateCoordenadas(lat, lon);
        const enSedeResult = await verEnSede(client, perfilId);

        if (!enSedeResult) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'Perfil no encontrado'
            });
        }

        if (!enSedeResult.en_sede) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El usuario ya esta fuera de su centro de trabajo'
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
        const horaActual = now.toTimeString().slice(0, 5);

        let notaAuditoria = 'Salida registrada';

        if (horaActual > asignacion.hora_salida) {
            notaAuditoria = 'Horas extra';
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

        await actualizarPerfil(client, perfilId, false);

        await client.query('COMMIT');
        return res.status(200).json({
            status: 'success',
            message: 'Salida registrada'
        })

    }catch(error){
        return res.status(400).json({
            message:'Error en el servidor',
            error: message.error
        })
    }finally{
        client.release();
    }
};

export const asistencias = async(req, res)=>{
    try{
        const valor = await countAsistencias(pool);

        if(valor === 0){
            return res.status(200).json({
                conteo: 0,
                message:'Nadie registra su entrada aún'
            })
        }

        return res.status(200).json({
            status:'success',
            conteo: valor
        })

    }catch(error){
        console.log(error);
        return res.status(400).json({
            status:'error'
        })
    }
};

export const atrasos = async(req, res)=>{
    try{
        const valor = await countAtrasos(pool);
        
        if(valor === 0){
            return res.status(200).json({
                conteo: 0,
                message:'No hay atrasos aún'

            })
        }

        return res.status(200).json({
            status:'success',
            conteo: valor
        })

    }catch(error){
        console.log(error);
        return res.status(400).json({
            status:'error'
        })
    }
}