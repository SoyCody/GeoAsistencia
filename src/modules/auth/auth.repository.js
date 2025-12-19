export async function crearPersona(client, persona) {
  const query = `
    INSERT INTO persona (nombre_completo, cedula, email, telefono)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [
    persona.nombreCompleto,
    persona.cedula,
    persona.email,
    persona.telefono
  ];

  const { rows } = await client.query(query, values);
  return rows[0].id;
};



export async function crearPerfil(client, perfil) {
  const query = `
    INSERT INTO perfil (
      persona_id,
      codigo_empleado,
      cargo,
      password_hash,
      es_admin
    )
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [
    perfil.personaId,
    perfil.codigoEmpleado,
    perfil.cargo,
    perfil.passwordHash,
    perfil.esAdmin
  ];

  await client.query(query, values);
};

export async function checkEmail(client, email) {
  const query =`
    SELECT 1 FROM persona WHERE LOWER(email) = LOWER($1)
  `;
  const result = await client.query(query, [email]);
  return result.rowCount > 0;
};
