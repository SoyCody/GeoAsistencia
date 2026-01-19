export async function assign(client, perfilId, geocercaId, hora_entrada, hora_salida) {
    const query = `
        INSERT INTO asignacion_laboral (perfil_id, geocerca_id, created_at, updated_at, hora_entrada, hora_salida )
        VALUES ($1, $2, NOW(), NOW(), $3, $4)
    `;
    return await client.query(query, [perfilId, geocercaId, hora_entrada, hora_salida]);
};

export async function watchAssign(client, perfilId) {
    const query = `
        SELECT * FROM perfil WHERE id = $1
    `;
    return await client.query(query, [perfilId]);
};

export async function existsAssign(client, perfilId, geocercaId) {
    const query = `
        SELECT 1
        FROM asignacion_laboral
        WHERE perfil_id = $1
        AND geocerca_id = $2
    `;
    const result = await client.query(query, [perfilId, geocercaId]);
    return result.rowCount > 0;
}

export async function removeAssign(client, perfilId, geocercaId) {
    const query = `
        DELETE FROM asignacion_laboral
        WHERE perfil_id = $1 AND geocerca_id = $2
    `;
    await client.query(query, [perfilId, geocercaId]);
};

// Obtener usuarios asignados a una geocerca
export async function getUsersByGeocerca(pool, geocercaId) {
    const query = `
        SELECT 
            pf.id AS user_id,
            pf.codigo_empleado AS user_codigo,
            per.nombre_completo AS user_nombre_completo,
            per.email AS user_email,
            pf.cargo,
            al.hora_entrada,
            al.hora_salida,
            al.created_at AS fecha_asignacion
        FROM asignacion_laboral al
        INNER JOIN perfil pf ON al.perfil_id = pf.id
        INNER JOIN persona per ON pf.persona_id = per.id
        WHERE al.geocerca_id = $1
          AND pf.estado = 'ACTIVO'
        ORDER BY per.nombre_completo ASC
    `;
    const result = await pool.query(query, [geocercaId]);
    return result.rows;
}

// Obtener usuarios disponibles para asignar a una geocerca
export async function getAvailableUsersForGeocerca(pool, geocercaId, sedeId) {
    const query = `
        SELECT 
            pf.id AS user_id,
            pf.codigo_empleado AS user_codigo,
            per.nombre_completo AS user_nombre_completo,
            per.email AS user_email,
            pf.cargo
        FROM perfil pf
        INNER JOIN persona per ON pf.persona_id = per.id
        INNER JOIN asignacion_laboral al_sede ON pf.id = al_sede.perfil_id
        INNER JOIN geocerca g_sede ON al_sede.geocerca_id = g_sede.id
        WHERE g_sede.sede_id = $2
          AND pf.estado = 'ACTIVO'
          AND pf.id NOT IN (
              SELECT perfil_id 
              FROM asignacion_laboral 
              WHERE geocerca_id = $1
          )
        GROUP BY pf.id, per.nombre_completo, per.email, pf.cargo, pf.codigo_empleado
        ORDER BY per.nombre_completo ASC
    `;
    const result = await pool.query(query, [geocercaId, sedeId]);
    return result.rows;
}
