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
}
