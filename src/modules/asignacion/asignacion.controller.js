import { pool } from '../../config/db.js'; 
import { assign, watchAssign, existsAssign, removeAssign } from './assign.repository.js';
import { auditarCambio } from '../auditoria/auditoria.service.js';
import { AUDIT_ACTIONS, AUDIT_TABLES } from '../auditoria/auditoria.constants.js'; 

export const assignWorker = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id;

    try {
        await client.query('BEGIN');

        const { perfilId, geocercaId } = req.body;

        if (!perfilId ) {
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

        await assign(client, perfilId, geocercaId);

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.ASIGNACION_LABORAL,
            accion: AUDIT_ACTIONS.CREATE,
            detalle: {
                perfilId,
                geocercaId
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
            message: 'Error interno del servidor'
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

        const { perfilId, geocercaAnteriorId, geocercaNuevaId } = req.body;

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
        await assign(client, perfilId, geocercaNuevaId);

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
