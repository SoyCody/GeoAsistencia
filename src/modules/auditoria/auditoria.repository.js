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
