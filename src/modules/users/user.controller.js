import { pool } from '../../config/db.js';
import { 
  me, 
  listUsers, 
  verAdmin, 
  changeState, 
  changeRole, 
  consultStateCode,
  watchUser,
  countUsers,
  countEveryone
} from './user.repository.js';
import { auditarCambio } from '../auditoria/auditoria.service.js';
import { AUDIT_ACTIONS, AUDIT_TABLES } from '../auditoria/auditoria.constants.js';

export const getMe = async (req, res) => {
  const perfilId = req.user?.id;
  const client = await pool.connect();

  try {

    const result = await me(client, perfilId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No se ha encontrado ningún usuario"
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error"
    });
  } finally{
    client.release();
  }
};

export const watch = async(req, res)=>{
  const client = await pool.connect();
  try{
    const { id } = req.params;
    if(!id){
      return res.status(400).json({
        message:'Debe haber el id del usaurio'
      })
    }

    const result = await watchUser(client, id);

    if(result.rows.length === 0){

      return res.status(404).json({
        status:'error',
        message:'No se ha encontrado ningun usuario'
      })
    }

    return res.status(200).json({
      status:'success',
      data: result.rows[0]
    })

  } catch(error){
    console.log(error);
    return res.status(400).json({
      status:'error'
    })
  } finally{
    client.release();
  }
}


const listUsersByState = (estado) => async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await listUsers(client, estado);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `No se ha encontrado ningun usuario ${estado.toLowerCase()}`
      });
    }

    return res.status(200).json({
      status: "success",
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error(`Error al listar usuarios ${estado.toLowerCase()}:`, error);
    return res.status(500).json({
      status: "error",
      error: `Error al obtener usuarios ${estado.toLowerCase()}`
    });
  } finally {
    client.release();
  }
};

export const listActives = listUsersByState("ACTIVO");
export const listSuspended = listUsersByState("SUSPENDIDO");
export const listDeleted = listUsersByState("BORRADO");

export const assignAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const usuario = await verAdmin(client, id)
    const antes = usuario.rows[0].es_admin;
    let bool = true;

    // Verificar si existe el usuario
    if (usuario.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    };

    // Solo se puede asignarse a usuarios activos
    if (usuario.rows[0].estado !== 'ACTIVO') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Solo se pueden asignar privilegios a usuarios activos'
      });
    };

    // Solo usuarios activos pueden asignarse como admin
    if (usuario.rows[0].es_admin) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'El usuario ya es administrador'
      });
    };

    const result = await changeRole(client, bool, id);
    const despues = result.rows[0].es_admin;

    await auditarCambio(client, {
      adminPerfilId: req.user.id,
      tabla: AUDIT_TABLES.PERFIL,
      accion: AUDIT_ACTIONS.ROLE_CHANGE,
      detalle:{
        codigoEmpleado: usuario.rows[0].codigo_empleado,
        cambio:{
          antes:{ es_admin: antes},
          despues:{ es_admin: despues}
        }
      }
    });

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Privilegios de administrador asignados exitosamente',
      usuario: {
        codigo_empleado: usuario.rows[0].codigo_empleado,
        es_admin: bool
      }
    });

  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
    return res.status(400).json({
      status: 'error'
    })
  } finally {
    client.release();
  }
};

export const revokeAdmin = async (req, res) => {
  const client = await pool.connect();
  try {

    const { id } = req.params;
    const bool = false;
    await client.query('BEGIN');

    const usuario = await verAdmin(client, id);
    const antes = usuario.rows[0].es_admin;

    // Verificar si existe el usuario
    if (usuario.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    };

    // Solo se puede asignarse a usuarios activos
    if (usuario.rows[0].estado !== 'ACTIVO') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Solo se pueden asignar privilegios a usuarios activos'
      });
    };

    if (!usuario.rows[0].es_admin) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'El usuario no es administrador'
      });
    };

    const result = await changeRole(client, bool, id);
    const despues = result.row[0].is_admin;

    await auditarCambio(client, {
      adminPerfilId: req.user.id,
      tabla: AUDIT_TABLES.PERFIL,
      accion: AUDIT_ACTIONS.ROLE_CHANGE,
      detalle:{
        codigoEmpleado: usuario.rows[0].codigo_empleado,
        cambio: {
          antes:{ es_admin: antes},
          despues:{ es_admin: despues}
        }
      }
    })

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Privilegios de administrador revocado exitosamente',
      usuario: {
        id: id,
        codigo_empleado: usuario.rows[0].codigo_empleado,
        es_admin: bool
      }
    });

  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
    return res.status(400).json({
      status: "error"
    })
  } finally {
    client.release();
  }
};

const alterState = (estado) => async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    await client.query('BEGIN');

    // Obtener información del usuario antes de cualquier cambio
    const usuarioInfo = await consultStateCode(client, id);

    // Verificar si el usuario existe
    if (usuarioInfo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const { codigo_empleado, estado: estadoActual, es_admin } = usuarioInfo.rows[0];

    // Verificar que no sea administrador
    if (es_admin) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'No puede alterar el estado de un administrador'
      });
    }

    // Verificar que el estado sea diferente
    if (estadoActual === estado) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `El usuario ya está en estado ${estado}`
      });
    }

    // Cambiar el estado
    const resultado = await changeState(client, estado, id);

    // Verificar que se actualizó correctamente
    if (resultado.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({
        error: 'No se pudo actualizar el estado del usuario'
      });
    }

    const estadoNuevo = resultado.rows[0].estado;

    // 7. Auditar el cambio
    await auditarCambio(client, {
      adminPerfilId: req.user.id,
      tabla: AUDIT_TABLES.PERFIL,
      accion: AUDIT_ACTIONS.STATUS_CHANGE,
      detalle: {
        codigoEmpleado: codigo_empleado,
        cambio: {
          antes: { estado: estadoActual },
          despues: { estado: estadoNuevo }
        }
      }
    });

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Estado actualizado correctamente',
      usuario: {
        codigo_empleado,
        estado: estadoNuevo
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar estado:', error);
    return res.status(500).json({
      error: 'Error al cambiar el estado del usuario'
    });
  } finally {
    client.release();
  }
};

export const deleteUser = alterState('BORRADO');
export const suspendUser = alterState('SUSPENDIDO');

const countByState =(estado) => async(req, res) => {
  try{
    const conteo = await countUsers(pool, estado);
     return res.status(200).json({
      status:'succes',
      count: conteo
     })
  }catch(error){
    console.log(error);
    return res.status(400).json({
      message:'Error al contar usuarios'
    })
  }
};

export const actives = countByState('ACTIVO');
export const suspended = countByState('SUSPENDIDO');
export const deleted = countByState('BORRADO');

export const countTotal = async (req, res)=>{
  try{
      const total = await countEveryone(pool);
      return res.status(200).json({
        status:'success',
        count: total
      })
  }catch(error){
    console.log(error);
    return res.status(400).json({
      state:'error'
    })
  }
}