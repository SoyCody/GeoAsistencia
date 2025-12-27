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
      RETURNING nombre, direccion
    `;
    const result = await client.query(query, [nombre, direccion, latitud, longitud]);
    return result.rows[0];
}

export async function readSedes(pool) {
    const query = `
      SELECT 
    s.nombre AS nombre_sede,
    COUNT(g.id) AS cantidad_geocercas,
    COALESCE(STRING_AGG(g.nombre_zona, ', '), 'Sin geocercas asignadas') AS nombres_geocercas
    FROM sede s
    LEFT JOIN geocerca g ON s.id = g.sede_id
    GROUP BY s.id, s.nombre
    ORDER BY s.nombre ASC;`
    return await pool.query(query);
}

export async function readById(pool, id) {
    const query = `
    SELECT 
        s.nombre AS nombre_sede,
        COUNT(g.id) AS cantidad_geocercas,
        COALESCE(STRING_AGG(g.nombre_zona, ', '), 'Sin geocercas asignadas') AS nombres_geocercas
    FROM sede s
    LEFT JOIN geocerca g ON s.id = g.sede_id    
    WHERE s.id = $1  -- <--- EL WHERE DEBE IR AQUÍ
    GROUP BY s.id, s.nombre; -- El ORDER BY no es necesario si buscas solo un ID
    `

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

export async function verSede(client, id){
    const query = `
    SELECT nombre, direccion FROM sede WHERE id = $1`
    const result = await client.query(query, [id]);
    return result.rows[0];
}


export async function modifySede(client, id, nombre, direccion, latitud, longitud){
    const query = `
        UPDATE sede
        SET nombre = $2, direccion = $3, latitud = $4, longitud = $5
        WHERE id = $1
        RETURNING nombre, direccion
    `;
    return await client.query(query, [id, nombre, direccion, latitud, longitud]);
};


export async function borrar(client, id){
    const query = `
    DELETE FROM sede WHERE id = $1`

    await client.query(query, [id]);
    return true;
}