import { pool } from '../../config/db.js';
import { obtenerAuditorias } from './auditoria.repository.js';

export const getAuditorias = async (req, res) => {
    const client = await pool.connect();

    try {
        const auditorias = await obtenerAuditorias(client);

        return res.status(200).json({
            status: 'success',
            count: auditorias.length,
            data: auditorias
        });

    } catch (error) {
        console.error('Error al obtener auditorías:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener registros de auditoría'
        });
    } finally {
        client.release();
    }
};
