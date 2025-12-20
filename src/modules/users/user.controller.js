import { pool } from '../../config/db.js';
import { listUsers, verAdmin } from './user.repository.js';

export const getMe = async (req, res) => {
  const perfilId = req.user?.id; // ← JWT apunta a perfil.id

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id, p.codigo_empleado, p.cargo,
        p.es_admin, p.estado, p.created_at,
        per.nombre_completo, per.email, per.telefono
      FROM perfil p
      INNER JOIN persona per ON p.persona_id = per.id
      WHERE p.id = $1
        AND p.estado = 'ACTIVO'
      `,
      [perfilId]
    );

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
  }
};

const listUsersByState = (estado) => async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await listUsers(client, estado);

    if(result.rows.length  === 0){
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
export const listDeleted = listUsersByState("ELIMINADO");

export const assignAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const usuario = await verAdmin(client, id)

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

    // Asignar privilegios de admin
    await client.query(
      `UPDATE perfil 
       SET es_admin = true, updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Privilegios de administrador asignados exitosamente',
      usuario: {
        codigo_empleado: usuario.rows[0].codigo_empleado,
        es_admin: true
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

export const revokeAdmin = async(req, res)=>{
  const client = await pool.connect();
  try{
    
    const { id } = req.params;
    await client.query('BEGIN');

    const usuario = await verAdmin(client, id);
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

    await client.query(
      `UPDATE perfil 
       SET es_admin = false, updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Privilegios de administrador revocado exitosamente',
      usuario: {
        id: id,
        codigo_empleado: usuario.rows[0].codigo_empleado,
        es_admin: false
      }
    });

  }catch(error){
    console.log(error);
    await client.query('ROLLBACK');
    return res.status(400).json({
      status: "error"
    })
  } finally{
    client.release();
  }
};