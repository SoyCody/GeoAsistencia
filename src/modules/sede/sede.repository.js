export async function checkDirection(client, direccion) {
    const query = `
      SELECT 1 FROM sede WHERE LOWER(direccion) = LOWER($1)
    `;
    const result = await client.query(query, [direccion]);
    return result.rowCount > 0;
}

export async function insertSede(client, nombre, direccion, latitud, longitud) {
    const query = `
      INSERT INTO sede (nombre, direccion, latitud, longitud)
      VALUES ($1, $2, $3, $4)
      RETURNING * `;
    // RETURNING * devuelve todo (incluido el ID generado y created_at)
    const result = await client.query(query, [nombre, direccion, latitud, longitud]);
    return result.rows[0];
}

export async function readSedes(pool) {
    const query = `
      SELECT 
        s.id, -- Agregado: Necesitas el ID para poder hacer click en "Editar" en tu tabla
        s.nombre AS nombre_sede,
        s.direccion,
        COUNT(g.id) AS cantidad_geocercas,
        COALESCE(STRING_AGG(g.nombre_zona, ', '), 'Sin geocercas asignadas') AS nombres_geocercas
      FROM sede s
      LEFT JOIN geocerca g ON s.id = g.sede_id
      GROUP BY s.id, s.nombre
      ORDER BY s.nombre ASC;
    `;
    const result = await pool.query(query);
    return result.rows; // Corregido: Devuelve el array de datos limpio
}

export async function readById(pool, id) {
    const query = `
    SELECT 
        s.id,
        s.nombre AS nombre_sede,
        s.direccion,
        s.latitud, -- Agregado: Necesario para mostrar el mapa
        s.longitud, -- Agregado: Necesario para mostrar el mapa
        COUNT(g.id) AS cantidad_geocercas,
        COALESCE(STRING_AGG(g.nombre_zona, ', '), 'Sin geocercas asignadas') AS nombres_geocercas
    FROM sede s
    LEFT JOIN geocerca g ON s.id = g.sede_id    
    WHERE s.id = $1  -- Corregido: El WHERE va antes del GROUP BY
    GROUP BY s.id, s.nombre; 
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

export async function verSede(client, id){
    const query = `
    SELECT id, nombre, direccion, latitud, longitud 
    FROM sede 
    WHERE id = $1
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
}

export async function modifySede(client, id, nombre, direccion, latitud, longitud){
    const query = `
        UPDATE sede
        SET nombre = $2, 
            direccion = $3, 
            latitud = $4, 
            longitud = $5,
            updated_at = NOW() -- Agregado: Actualiza la fecha de auditoría
        WHERE id = $1
        RETURNING *
    `;
    const result = await client.query(query, [id, nombre, direccion, latitud, longitud]);
    return result.rows[0]; // Corregido: Devuelve el dato actualizado
};

export async function borrar(client, id){
    const query = `DELETE FROM sede WHERE id = $1`;
    await client.query(query, [id]);
    return true;
}