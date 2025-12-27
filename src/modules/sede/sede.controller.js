import { pool } from "../../config/db.js";
import { validateSede } from "./sede.validator.js";
import {
    checkDirection,
    insertSede,
    readSedes,
    readById,
    verSede,
    modifySede,
    borrar
} from "./sede.repository.js";
import { auditarCambio } from "../auditoria/auditoria.service.js";
import { AUDIT_ACTIONS, AUDIT_TABLES } from "../auditoria/auditoria.constants.js";

export const createSede = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id;

    try {
        const { nombre, direccion, latitud, longitud } = validateSede(req.body);
        await client.query('BEGIN');
        const directionExist = await checkDirection(client, direccion);

        if (directionExist) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Esta dirección ya existe' });
        }

        await insertSede(client, nombre, direccion, latitud, longitud);

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.SEDE,
            accion: AUDIT_ACTIONS.CREATE,
            detalle: {
                creado: {
                    nombre,
                    direccion
                }
            }
        });

        await client.query('COMMIT');
        return res.status(201).json({
            message: 'Sede creada correctamente',
            sede: {
                nombre,
                direccion
            }
        });

    } catch (error) {
        console.log(error);
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Error interno' });
    } finally {
        client.release()
    }
}


export const listSedes = async (req, res) => {
    try {
        const result = await readSedes(pool);
        const sedes = result.rows;
        return res.status(200).json({
            status: 'succes',
            sedes
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: 'Hubo un error al listar las sedes'
        })
    }
}

export const getSedeById = async (req, res) => {
    try {
        const { id } = req.params;
        const sede = await readById(pool, id);
        if (!sede) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró la sede'
            })
        }
        return res.status(200).json({
            status: 'success',
            sede
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: 'Hubo un error al obtener la sede por ID'
        })
    }
}


export const updateSede = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { nombre, direccion, latitud, longitud } = validateSede(req.body);
        const idAdmin = req.user.id;

        client.query('BEGIN');
        const sede = await verSede(client, id);

        if (!sede) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: "No se encontró la sede para actualizar"
            });
        }

        const antes = {
            nombre: sede.nombre,
            direccion: sede.direccion
        };


        if (!id) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: "No se encontró la sede para actualizar"
            })
        }

        const result = await modifySede(client, id, nombre, direccion, latitud, longitud);
        if (!result) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: "No se pudo actualizar la sede"
            })
        }

        const despues = {
            nombre: result.rows[0].nombre,
            direccion: result.rows[0].direccion
        };

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.SEDE,
            accion: AUDIT_ACTIONS.UPDATE,
            detalle: {
                cambio: {
                    antes,
                    despues
                }
            }
        });

        await client.query('COMMIT');
        return res.status(200).json({
            message: 'Sede actualizada correctamente',
            sede: {
                nombre: despues.nombre,
                direccion: despues.direccion
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Hubo un error al actualizar la sede'
        })
    } finally {
        client.release();
    }
};


export const deleteSede = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const idAdmin = req.user.id;

        client.query('BEGIN');
        if (!id) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Debe proporcionar un ID de sede válido'
            })
        }

        const result = await verSede(client, id);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'No se encontró la sede para eliminar'
            })
        }

        const deleted = {
            nombre: result.nombre,
            direccion: result.direccion
        }

        await borrar(client, id);
        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.SEDE,
            accion: AUDIT_ACTIONS.DELETE,
            detalle: {
                eliminado: deleted
            }
        });

        client.query('COMMIT');

        return res.status(200).json({
            message: 'Sede eliminada correctamente',
            sede: deleted
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Hubo un error al eliminar la sede'
        })
    } finally {
        client.release();
    }
};