import { pool } from '../../config/db.js';

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


export const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id, p.codigo_empleado, p.cargo,
        p.es_admin, p.estado, p.created_at,
        per.nombre_completo, per.email, per.telefono
      FROM perfil p
      INNER JOIN persona per ON p.persona_id = per.id
      WHERE p.estado = 'ACTIVO'
      `
    );

    return res.status(200).json({
      status: "success",
      data: result.rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error"
    });
  }
};
