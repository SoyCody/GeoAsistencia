export async function me (client, id){
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

export async function watchUser(client, id){
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

export async function listUsers (client, state){

    const query = (
      `
      SELECT 
        p.id, p.codigo_empleado, p.cargo,
        p.es_admin, p.estado, p.created_at,
        per.nombre_completo, per.email, per.telefono
      FROM perfil p
      INNER JOIN persona per ON p.persona_id = per.id
      WHERE p.estado = $1
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

export async function changeRole(client, bool, id){
    const query=(
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