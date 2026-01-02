export async function validarGeocercaAsignada(client, perfilId, lat, lon) {
  const query = `
    SELECT g.id, g.nombre_zona
    FROM asignacion_laboral al
    JOIN geocerca g ON g.id = al.geocerca_id
    WHERE al.perfil_id = $1
    AND ST_DWithin(
      g.punto_central,
      ST_SetSRID(ST_MakePoint($2::numeric, $3::numeric), 4326)::geography, -- CORREGIDO CON CAST
      g.radio_metros
    )
    LIMIT 1
  `;
  // Nota: ST_MakePoint(Longitud/X, Latitud/Y) -> Por eso pasamos lon ($2) primero en el array
  const result = await client.query(query, [perfilId, lon, lat]);
  return result.rows[0] || null;
}

export async function registrarAsistencia(
  client,
  perfilId,
  geocercaId,
  tipo,
  lat,
  lon,
  esValido,
  nota
) {
  const query = `
    INSERT INTO registro_asistencia (
      perfil_id,
      geocerca_validada_id,
      fecha_hora_servidor,
      tipo_evento,
      latitud_movil,
      longitud_movil,
      ubicacion_movil,
      es_valido,
      nota_auditoria
    )
    VALUES (
      $1, $2, NOW(), $3,
      $4::numeric, $5::numeric, -- CAST EXPLÍCITO PARA EVITAR EL ERROR
      ST_SetSRID(ST_MakePoint($5::numeric, $4::numeric), 4326)::geography,
      $6, $7
    )
  `;

  await client.query(query, [
    perfilId,   // $1
    geocercaId, // $2
    tipo,       // $3
    lat,        // $4
    lon,        // $5
    esValido,   // $6
    nota        // $7
  ]);
}

export async function verEnSede(client, perfilId) {
  // OJO: Asegúrate de que la columna 'en_sede' exista en tu tabla 'perfil'
  // Si no existe, debes crearla: ALTER TABLE perfil ADD COLUMN en_sede BOOLEAN DEFAULT FALSE;
  const query = `
    SELECT en_sede 
    FROM perfil 
    WHERE id = $1
  `;
  const result = await client.query(query, [perfilId]);
  return result.rows[0]; 
}

export async function obtenerGeocerca(client, perfilId) {
  const query = `
    SELECT geocerca_id
    FROM asignacion_laboral
    WHERE perfil_id = $1
    LIMIT 1
  `;
  const result = await client.query(query, [perfilId]);
  return result.rows[0] || null;
}

export async function actualizarPerfil(client, perfilId, enSede) {
  const query = `
    UPDATE perfil
    SET en_sede = $2
    WHERE id = $1
  `;
  const result = await client.query(query, [perfilId, enSede]);
  return result.rowCount;
}

export async function obtenerAsignacion(client, perfilId, geocercaId) {
  const query = `
    SELECT hora_entrada, hora_salida
    FROM asignacion_laboral
    WHERE perfil_id = $1
    AND geocerca_id = $2
  `;
  const result = await client.query(query, [perfilId, geocercaId]);
  return result.rows[0] || null;
}