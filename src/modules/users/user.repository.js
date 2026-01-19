export async function me(client, id) {
  const query = (
    `
      SELECT 
        p.id, p.codigo_empleado, p.cargo,
        p.es_admin, p.estado, p.created_at,
        per.nombre_completo, per.email, per.telefono
      FROM perfil p
      INNER JOIN persona per ON p.persona_id = per.id
      WHERE p.id = $1
        AND p.estado = 'ACTIVO'
      `);

  return await client.query(query, [id]);

};

export async function watchUser(client, id) {
  const query = (`
    SELECT 
        p.id, p.codigo_empleado, p.cargo,
        p.es_admin, p.estado, p.created_at,
        per.nombre_completo, per.email, per.telefono
      FROM perfil p
      INNER JOIN persona per ON p.persona_id = per.id
      WHERE p.id = $1
      RETURNING *
  `)
  return await client.query(query, [id]);
}

export async function listUsers(client, state) {

  const query = (
    `
      SELECT 
        pf.id AS user_id,
        pf.codigo_empleado AS user_codigo,
        pf.cargo,
        pf.es_admin,
        pf.estado,
        pf.created_at,
        CASE WHEN pf.es_admin THEN 'ADMIN' ELSE 'USER' END AS user_rol,
        per.nombre_completo AS user_nombre_completo,
        per.email AS user_email,
        per.telefono,
        s.nombre AS sede_nombre
      FROM perfil pf
      INNER JOIN persona per ON pf.persona_id = per.id
      LEFT JOIN asignacion_laboral al ON pf.id = al.perfil_id
      LEFT JOIN geocerca g ON al.geocerca_id = g.id
      LEFT JOIN sede s ON g.sede_id = s.id
      WHERE pf.estado = $1
      GROUP BY pf.id, per.id, s.nombre
      ORDER BY pf.codigo_empleado ASC
      `
  );

  return await client.query(query, [state]);
};

export async function verAdmin(client, id) {
  const query = `
    SELECT 
      pe.id AS perfil_id,
      pe.codigo_empleado,
      pe.es_admin,
      pe.estado
    FROM perfil pe
    INNER JOIN persona p ON pe.persona_id = p.id
    WHERE pe.id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [id]);
  return result || null;
};

export async function changeRole(client, bool, id) {
  const query = (
    `UPDATE perfil 
       SET es_admin = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING es_admin`
  );
  return await client.query(query, [bool, id]);

}

export async function consultStateCode(client, id) {
  const query = `
    SELECT 
      estado, 
      codigo_empleado,
      es_admin
    FROM perfil
    WHERE id = $1
    LIMIT 1
  `;
  return await client.query(query, [id]);
}

export async function changeState(client, state, id) {
  const query = `
    UPDATE perfil 
    SET 
      estado = $1, 
      updated_at = NOW() 
    WHERE id = $2
    RETURNING id, codigo_empleado, estado
  `;
  return await client.query(query, [state, id]);
}

export async function consultaAdmin(client, id) {
  const query = `
    SELECT es_admin 
    FROM perfil 
    WHERE id = $1
    LIMIT 1
  `;
  return await client.query(query, [id]);
}

export async function countUsers(pool, state) {
  const query = `
    SELECT COUNT(*) AS total
    FROM perfil
    WHERE estado = $1
  `;

  const result = await pool.query(query, [state]);
  return Number(result.rows[0].total);
}

export async function countEveryone(pool) {
  const query = `
    SELECT COUNT(*) AS total
    FROM perfil
  `
  const result = await pool.query(query);
  return Number(result.rows[0].total);
}

export async function update(client, email, telefono, cargo, id) {
  const query = `
    WITH perfil_update AS (
      UPDATE perfil
      SET cargo = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING persona_id, cargo
    ),
    persona_update AS (
      UPDATE persona
      SET email = $1, 
          telefono = $2,
          updated_at = NOW()
      WHERE id = (SELECT persona_id FROM perfil_update)
      RETURNING email, telefono
    )
    SELECT 
      pu.cargo,
      pe.email, 
      pe.telefono
    FROM perfil_update pu
    JOIN persona_update pe ON true
  `;

  const result = await client.query(query, [email, telefono, cargo, id]);
  return result;
}
