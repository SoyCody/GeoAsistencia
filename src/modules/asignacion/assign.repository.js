export async function assign(client, perfilId, geocercaId){
    const query = `
        INSERT INTO asignacion_laboral (perfil_id, geocerca_id, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
    `;
    return await client.query(query, [perfilId, geocercaId]);
};

export async function watchAssign(client, perfilId){
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