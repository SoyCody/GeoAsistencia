import { validateUser } from './auth.validator.js';
import { crearPersona, crearPerfil, checkEmail, getEstadoPerfil } from './auth.repository.js';
import { pool } from '../../config/db.js';
import { generarCodigo } from './auth.utils.js';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/jwt.js';
import { auditarCambio } from '../auditoria/auditoria.service.js';
import { AUDIT_ACTIONS, AUDIT_TABLES } from '../auditoria/auditoria.constants.js';

// Nuevo endpoint para login móvil (con email)
export const mobileLogin = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario por email
        const result = await client.query(
            `SELECT 
                p.id AS perfil_id,
                p.codigo_empleado,
                p.password_hash,
                p.es_admin,
                p.estado,
                p.cargo,
                per.id AS persona_id,
                per.nombre_completo,
                per.email
             FROM perfil p
             INNER JOIN persona per ON per.id = p.persona_id
             WHERE per.email = $1
             LIMIT 1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        const perfil = result.rows[0];

        // Verificar estado
        if (perfil.estado === 'SUSPENDIDO') {
            return res.status(403).json({
                message: 'Tu cuenta está suspendida, contacta al administrador'
            });
        }

        if (perfil.estado === 'BORRADO') {
            return res.status(403).json({
                message: 'Tu cuenta ha sido eliminada'
            });
        }

        // Validar contraseña
        const validPassword = await bcrypt.compare(password, perfil.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        // Obtener geocercas asignadas
        const geocercasResult = await client.query(
            `SELECT DISTINCT
                g.id,
                g.nombre_zona,
                g.radio_metros,
                ST_Y(g.punto_central::geometry) as latitud,
                ST_X(g.punto_central::geometry) as longitud,
                s.nombre as sede_nombre
            FROM asignacion_laboral al
            INNER JOIN geocerca g ON al.geocerca_id = g.id
            INNER JOIN sede s ON g.sede_id = s.id
            WHERE al.perfil_id = $1`,
            [perfil.perfil_id]
        );

        // Generar token
        const token = createToken(perfil.perfil_id);

        // Auditar login móvil
        await client.query('BEGIN');
        await auditarCambio(client, {
            adminPerfilId: perfil.perfil_id,
            tabla: AUDIT_TABLES.PERFIL,
            accion: 'LOGIN_MOBILE',
            detalle: {
                email: perfil.email,
                ip: req.ip || req.connection.remoteAddress
            }
        });
        await client.query('COMMIT');

        return res.status(200).json({
            user: {
                id: perfil.perfil_id,
                nombre_completo: perfil.nombre_completo,
                email: perfil.email,
                codigo_empleado: perfil.codigo_empleado,
                cargo: perfil.cargo,
                rol: perfil.es_admin ? 'ADMIN' : 'USER',
                estado: perfil.estado
            },
            token,
            geocercas: geocercasResult.rows.map(g => ({
                id: g.id,
                nombre_zona: g.nombre_zona,
                latitud: parseFloat(g.latitud),
                longitud: parseFloat(g.longitud),
                radio_metros: g.radio_metros,
                sede_nombre: g.sede_nombre
            }))
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en mobileLogin:', error);
        return res.status(500).json({
            message: 'Error en el servidor'
        });
    } finally {
        client.release();
    }
};

// Validar token y devolver datos del usuario
export const validateToken = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id; // Del middleware de autenticación

        // Obtener datos del usuario
        const result = await client.query(
            `SELECT 
                p.id,
                p.codigo_empleado,
                p.cargo,
                p.es_admin,
                p.estado,
                per.nombre_completo,
                per.email
             FROM perfil p
             INNER JOIN persona per ON per.id = p.persona_id
             WHERE p.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];

        // Verificar estado
        if (user.estado !== 'ACTIVO') {
            return res.status(403).json({
                message: 'Tu cuenta no está activa'
            });
        }

        // Obtener geocercas asignadas
        const geocercasResult = await client.query(
            `SELECT DISTINCT
                g.id,
                g.nombre_zona,
                g.radio_metros,
                ST_Y(g.punto_central::geometry) as latitud,
                ST_X(g.punto_central::geometry) as longitud,
                s.nombre as sede_nombre
            FROM asignacion_laboral al
            INNER JOIN geocerca g ON al.geocerca_id = g.id
            INNER JOIN sede s ON g.sede_id = s.id
            WHERE al.perfil_id = $1`,
            [userId]
        );

        return res.status(200).json({
            user: {
                id: user.id,
                nombre_completo: user.nombre_completo,
                email: user.email,
                codigo_empleado: user.codigo_empleado,
                cargo: user.cargo,
                rol: user.es_admin ? 'ADMIN' : 'USER',
                estado: user.estado
            },
            geocercas: geocercasResult.rows.map(g => ({
                id: g.id,
                nombre_zona: g.nombre_zona,
                latitud: parseFloat(g.latitud),
                longitud: parseFloat(g.longitud),
                radio_metros: g.radio_metros,
                sede_nombre: g.sede_nombre
            }))
        });

    } catch (error) {
        console.error('Error en validateToken:', error);
        return res.status(500).json({
            message: 'Error en el servidor'
        });
    } finally {
        client.release();
    }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }

        await client.query('BEGIN');

        // Obtener contraseña actual
        const result = await client.query(
            'SELECT password_hash FROM perfil WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const { password_hash } = result.rows[0];

        // Verificar contraseña actual
        const validPassword = await bcrypt.compare(currentPassword, password_hash);
        if (!validPassword) {
            await client.query('ROLLBACK');
            return res.status(401).json({
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Hash de la nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await client.query(
            'UPDATE perfil SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        );

        // Auditar cambio
        await auditarCambio(client, {
            adminPerfilId: userId,
            tabla: AUDIT_TABLES.PERFIL,
            accion: 'CHANGE_PASSWORD',
            detalle: {
                usuario_id: userId,
                ip: req.ip || req.connection.remoteAddress
            }
        });

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en changePassword:', error);
        return res.status(500).json({
            message: 'Error al cambiar la contraseña'
        });
    } finally {
        client.release();
    }
};

// Mantener funciones existentes...
export const registerUser = async (req, res) => {
    // ... código existente
};

export const login = async (req, res) => {
    // ... código existente del login web (con código de empleado)
};

export const logout = async (req, res) => {
    // ... código existente
};

export const createUser = async (req, res) => {
    // ... código existente
};
