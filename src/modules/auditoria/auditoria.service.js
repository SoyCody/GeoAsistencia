import { insertarAuditoria } from './auditoria.repository.js';

export async function auditarCambio(client, data) {
  if (!data.adminPerfilId) return;

  await insertarAuditoria(client, {
    adminPerfilId: data.adminPerfilId,
    tabla: data.tabla,
    accion: data.accion,
    detalle: data.detalle
  });
}
