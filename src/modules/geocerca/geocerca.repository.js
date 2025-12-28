// Verifica si existe la sede (Correcto)
export async function checkSedeExists(client, sede_id) {
    const query = 'SELECT 1 FROM sede WHERE id = $1';
    const result = await client.query(query, [sede_id]);
    return result.rowCount > 0;
};

export async function checkDuplicate(client, sede_id, nombre_zona) {
    const query = `
        SELECT 1
        FROM geocerca
        WHERE sede_id = $1 
        AND LOWER(nombre_zona) = LOWER($2)
    `;
    const result = await client.query(query, [sede_id, nombre_zona]); 
    return result.rowCount > 0;
};

export async function insertGeocerca(client, sede_id, nombre_zona, radio_metros, latitud, longitud) {
    const query = ` 
        INSERT INTO geocerca (
            sede_id, nombre_zona,
            radio_metros, punto_central
        )
        VALUES (
            $1, $2, $3,
            ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography 
        )
        RETURNING id, nombre_zona, radio_metros
    `;
    // NOTA: En ST_MakePoint usamos $5 (Longitud/X) primero y $4 (Latitud/Y) segundo
    const values = [sede_id, nombre_zona, radio_metros, latitud, longitud];
    const result = await client.query(query, values);
    return result.rows[0];
};

export async function verGeocerca(client, id){
    const query = `
        SELECT
            id, sede_id, nombre_zona, radio_metros,
            ST_Y(punto_central::geometry) as latitud,
            ST_X(punto_central::geometry) as longitud
        FROM geocerca
        WHERE id = $1
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
};

export async function alterGeocerca(client, id, nombre_zona, radio_metros, latitud, longitud) {
    const query = `
        UPDATE geocerca
        SET nombre_zona = $2,
            radio_metros = $3,
            punto_central = ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography,
            updated_at = NOW() -- Agregado para auditoría
        WHERE id = $1
        RETURNING id, nombre_zona, radio_metros
    `;
    const values = [id, nombre_zona, radio_metros, latitud, longitud];
    const result = await client.query(query, values);
    return result.rows[0];
}

export async function removeGeocerca(client, id) {
    const query = `
        DELETE FROM geocerca
        WHERE id = $1
        RETURNING id -- Solo retornamos ID para confirmar
    `;
    const result = await client.query(query, [id]);
    return result.rows[0];
};

export async function readGeocerca(pool, sede_id){
    const query = `
        SELECT 
            id, -- Necesitas el ID para poder editar/borrar en el front
            nombre_zona, 
            radio_metros,
            ST_Y(punto_central::geometry) AS latitud,
            ST_X(punto_central::geometry) AS longitud
        FROM geocerca
        WHERE sede_id = $1
        ORDER BY nombre_zona ASC
    `;
    const result = await pool.query(query, [sede_id]);
    return result.rows; 
};

export async function readGeocercaById(pool, id){
    const query = `
        SELECT 
            id,
            sede_id,
            nombre_zona, 
            radio_metros,
            ST_Y(punto_central::geometry) AS latitud,
            ST_X(punto_central::geometry) AS longitud
        FROM geocerca
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};