import { pool } from "../../config/db.js";
import { validateGeo, validateUpd } from "./geocerca.validator.js";
import { 
    checkDuplicate, 
    insertGeocerca, 
    checkSedeExists, 
    verGeocerca, 
    alterGeocerca,
    removeGeocerca,
    readGeocerca,
    readGeocercaById,
    listar
} from "./geocerca.repository.js";
import { auditarCambio } from "../auditoria/auditoria.service.js";
import { AUDIT_TABLES, AUDIT_ACTIONS } from "../auditoria/auditoria.constants.js";

export const createGeocerca = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const idAdmin = req.user.id;
        const { sede_id, nombre_zona, latitud, longitud, radio_metros } = await validateGeo(req.body);

        const existeSede = await checkSedeExists(client, sede_id);
        if (!existeSede) {
            await client.query(`ROLLBACK`);
            return res.status(404).json({
                message:'La sede no existe'
            })
        }

        const duplicate = await checkDuplicate(client, sede_id, nombre_zona);
        if (duplicate) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Ya existe una geocerca con ese nombre en la sede indicada'
            })
        }

        const result = await insertGeocerca(
            client, 
            sede_id, 
            nombre_zona, 
            radio_metros, 
            latitud, 
            longitud
        )

        if (!result) {
            await client.query('ROLLBACK');
            console.log(error);
            return res.status(400).json({
                message: "Error al insertar la geocerca"
            })
        }

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.GEOCERCA,
            accion: AUDIT_ACTIONS.CREATE,
            detalle: {
                creado: {
                    nombre_zona: result.nombre_zona,
                    radio_metros: result.radio_metros
                }
            }
        });

        await client.query('COMMIT');
        return res.status(201).json({
            status: 'succes',
            geocerca: {
                nombre: result.nombre_zona,
                radio: result.radio_metros
            }
        });

    } catch (error) {
        console.log(error);
        console.error(error.message);
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: 'Error interno'
        })
    } finally {
        client.release();
    }
};

export const updateGeocerca = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const idAdmin = req.user.id;
        const { id } = req.params;
        const { nombre_zona, latitud, longitud, radio_metros } = await validateUpd(req.body);

        if(!id){
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Debe ingresar el id de la geocerca'
            })
        }
        
        const antes = await verGeocerca(client, id);

        if (!antes) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'La geocerca no existe'
            })
        }

        const result = await alterGeocerca(
            client, 
            id, 
            nombre_zona, 
            radio_metros, 
            latitud, 
            longitud
        );

        if (!result) {
            await client.query('ROLLBACK');
            return res.status(500).json({
                message:'Error al alterar campos'
            })
        }

        await auditarCambio(client, {
            idminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.GEOCERCA,
            accion: AUDIT_ACTIONS.UPDATE,
            detalles: {
                antes: {
                    nombre_zona: antes.nombre_zona,
                    radio_metros: antes.radio_metros
                },
                despues:{
                    nombre_zona: result.nombre_zona,
                    radio_metros: result.radio_metros
                }
            }
        });

        await client.query('COMMIT');
        return res.status(200).json({
            status: 'success',
            actualizacion: {
                nombre: result.nombre_zona,
                radio: result.radio_metros
            }
        });

    } catch (error) {
        console.log(error);
        console.error(error.message);
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: 'Error interno'
        })
    } finally {
        client.release();
    }
};

export const deleteGeocerca = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const idAdmin = req.user.id;
        await client.query('BEGIN');
        const geocerca = await verGeocerca(client, id);

        if(!geocerca){
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'La geocerca no existe'
            })
        }

        const result = await removeGeocerca(client, id);

        if(!result){
            await client.query('ROLLBACK');
            return res.status(500).json({
                message: 'Error al eliminar la geocerca'
            })
        }

        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.GEOCERCA,
            accion: AUDIT_ACTIONS.DELETE,
            detalle: {
                eliminado: {
                    nombre_zona: result.nombre_zona,
                    radio_metros: result.radio_metros
                }
            }
        });

        await client.query('COMMIT');
        return res.status(200).json({
            status: 'success',
            mensaje: 'Geocerca eliminada correctamente'
        });

    } catch (error) {
        console.log(error);
        console.error(error.message);
        await client.query('ROLLBACK');
        return res.status(400).json({
            message: 'Errror interno'
        })
    } finally {
        client.release();
    }
};

export const listGeocercas = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({
                message:'Debe ingresar el id'
            })
        }

        const result =await readGeocerca (pool, id);
        if(!result){
            console.log(error);
            return res.status(404).json({
                message:'No se ha encontrado geocercas de esa sede'
            })
        }

        return res.status(200).json({
            status:'success',
            geocercas: result
        })

    } catch (error) {
        console.log(error);
        console.error(error.message);
        return res.staatus(500).json({
            message: 'Error interno'
        })
    }
};

export const listGeocercaById = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).json({
                message:'Debe ingresar el id'
            })
        }

        const result =await readGeocercaById (pool, id);
        if(!result){
            console.log(error);
            return res.status(404).json({
                message:'No se ha encontrado ninguna geocerca'
            })
        }

        return res.status(200).json({
            status:'success',
            geocerca: result
        })
    } catch (error) {
        console.log(error);
        return res.staatus(400).json({
            message: 'Error interno'
        })
    }
};   

export const listUsersByGeocerca = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Debe ingresar el id de la geocerca'
      });
    }

    const users = await listar(pool, id);

    if (users.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron usuarios para esta geocerca'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: users
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};
