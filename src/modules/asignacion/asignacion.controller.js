import { pool } from '../../config/db.js';
import { assign, watchAssign, existsAssign, removeAssign, getUsersByGeocerca, getAvailableUsersForGeocerca } from './assign.repository.js';
import { auditarCambio } from '../auditoria/auditoria.service.js';
import { AUDIT_ACTIONS, AUDIT_TABLES } from '../auditoria/auditoria.constants.js';
import { validateHorario } from '../../utils/horario.js';

export const assignWorker = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id;

    try {
        await client.query('BEGIN');

        const { perfilId, geocercaId, hora_entrada, hora_salida } = req.body;

        if (!perfilId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El id del perfil esobligatorio'
            });
        }

        if (!geocercaId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El id de la geocerca es obligatorio'
            });
        }

        const horario = validateHorario(hora_entrada, hora_salida);

        const perfilExists = await watchAssign(client, perfilId);
        if (perfilExists.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'No existe un perfil con ese id'
            });
        }

        const alreadyAssigned = await existsAssign(client, perfilId, geocercaId);
        if (alreadyAssigned) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'El perfil ya está asignado a esta geocerca'
            });
        }

        await assign(client, perfilId, geocercaId, horario.hora_entrada, horario.hora_salida);

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.ASIGNACION_LABORAL,
            accion: AUDIT_ACTIONS.CREATE,
            detalle: {
                perfilId,
                geocercaId,
                hora_entrada: horario.hora_entrada,
                hora_salida: horario.hora_salida
            }
        });

        await client.query('COMMIT');

        return res.status(201).json({
            message: 'Asignación realizada con éxito'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({
            message: 'Error interno del servidor',
            message: error.message
        });
    } finally {
        client.release();
    }
};

export const changeAssign = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id;

    try {
        await client.query('BEGIN');

        const { perfilId, geocercaAnteriorId, geocercaNuevaId, hora_entrada, hora_salida } = req.body;

        if (!perfilId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El id del perfil es obligatorio'
            });
        }

        if (!geocercaAnteriorId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El id de la geocerca anterior es obligatorio'
            });
        }

        if (!geocercaNuevaId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'El id de la geocerca nueva es obligatorio'
            });
        }

        const horario = validateHorario(hora_entrada, hora_salida);

        const existsOld = await existsAssign(client, perfilId, geocercaAnteriorId);
        if (!existsOld) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'La asignación original no existe'
            });
        }

        const existsNew = await existsAssign(client, perfilId, geocercaNuevaId);
        if (existsNew) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'El perfil ya está asignado a esta geocerca'
            });
        }

        await removeAssign(client, perfilId, geocercaAnteriorId);
        await assign(client, perfilId, geocercaNuevaId, horario.hora_entrada, horario.hora_salida);

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.ASIGNACION_LABORAL,
            accion: AUDIT_ACTIONS.UPDATE,
            detalle: {
                perfilId,
                antes: { geocercaId: geocercaAnteriorId },
                despues: { geocercaId: geocercaNuevaId }
            }
        });

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'Asignación modificada'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    } finally {
        client.release();
    }
};

// Listar usuarios asignados a una geocerca
export const listUsuariosGeocerca = async (req, res) => {
    try {
        const { geocercaId } = req.params;

        console.log('🔍 Listando usuarios para geocerca:', geocercaId);

        if (!geocercaId) {
            return res.status(400).json({
                message: 'ID de geocerca requerido'
            });
        }

        const usuarios = await getUsersByGeocerca(pool, geocercaId);

        console.log('✅ Usuarios encontrados:', usuarios.length);
        console.log('Usuarios:', JSON.stringify(usuarios, null, 2));

        return res.status(200).json({
            status: 'success',
            usuarios
        });
    } catch (error) {
        console.error('❌ Error al listar usuarios de geocerca:', error);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Listar usuarios disponibles para asignar
export const listUsuariosDisponibles = async (req, res) => {
    try {
        const { geocercaId } = req.params;
        const { sedeId } = req.query;

        if (!geocercaId) {
            return res.status(400).json({
                message: 'ID de geocerca requerido'
            });
        }

        const usuarios = await getAvailableUsersForGeocerca(pool, geocercaId, sedeId);

        return res.status(200).json({
            status: 'success',
            usuarios
        });
    } catch (error) {
        console.error('Error al listar usuarios disponibles:', error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

// Remover usuario de geocerca
export const removeAssignment = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id;

    try {
        await client.query('BEGIN');

        const { perfilId, geocercaId } = req.params;

        if (!perfilId || !geocercaId) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'ID de perfil y geocerca requeridos'
            });
        }

        const exists = await existsAssign(client, perfilId, geocercaId);
        if (!exists) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'La asignación no existe'
            });
        }

        await removeAssign(client, perfilId, geocercaId);

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.ASIGNACION_LABORAL,
            accion: AUDIT_ACTIONS.DELETE,
            detalle: {
                perfilId,
                geocercaId
            }
        });

        await client.query('COMMIT');

        return res.status(200).json({
            status: 'success',
            message: 'Usuario removido de la geocerca exitosamente'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al remover asignación:', error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    } finally {
        client.release();
    }
};
