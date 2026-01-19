export async function insertarAuditoria(client, audit) {
  const query = `
    INSERT INTO auditoria (
      admin_perfil_id,
      tabla_afectada,
      accion,
      detalle_cambio
    )
    VALUES ($1, $2, $3, $4)
  `;

  await client.query(query, [
    audit.adminPerfilId,
    audit.tabla,
    audit.accion,
    audit.detalle
  ]);
}

export async function obtenerAuditorias(client) {
  const query = `
    SELECT 
      a.id,
      a.tabla_afectada,
      a.accion,
      a.detalle_cambio,
      a.fecha_hora,
      pf.codigo_empleado
    FROM auditoria a
    INNER JOIN perfil pf ON pf.id = a.admin_perfil_id
    ORDER BY a.fecha_hora DESC
    LIMIT 50
  `;

  const result = await client.query(query);
  return result.rows;
}
