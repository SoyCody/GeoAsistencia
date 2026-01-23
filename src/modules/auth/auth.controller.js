import { validateUser } from './auth.validator.js';
import { crearPersona, crearPerfil, checkEmail, getEstadoPerfil } from './auth.repository.js';
import { pool } from '../../config/db.js';
import { generarCodigo } from './auth.utils.js';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/jwt.js';
import { auditarCambio } from '../auditoria/auditoria.service.js';
import { AUDIT_ACTIONS, AUDIT_TABLES } from '../auditoria/auditoria.constants.js';

export const registerUser = async (req, res) => {
    try {
        const { persona, perfil } = validateUser(req.body);
        const client = await pool.connect();
        const idAdmin = req.user.id;

        try {
            await client.query('BEGIN');

            const emailExists = await checkEmail(client, persona.email);
            if (emailExists) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    status: 'error',
                    message: 'El email ya está registrado'
                });
            }

            // Crear persona primero
            const personaId = await crearPersona(client, persona);

            // Crear perfil con el ID de persona
            const code = generarCodigo();
            const passwordHash = await bcrypt.hash(perfil.password, 10);

            const perfilData = {
                personaId,
                codigoEmpleado: code,
                cargo: perfil.cargo,
                passwordHash: passwordHash
            };

            const perfilInfo = await crearPerfil(client, perfilData);

            await auditarCambio(client, {
                adminPerfilId: idAdmin,
                tabla: AUDIT_TABLES.PERFIL,
                accion: AUDIT_ACTIONS.CREATE,
                detalle: {
                    creado: {
                        codigoEmpleado: perfilInfo.codigo_empleado,
                        cargo: perfilInfo.cargo
                    }
                }
            });

            await client.query('COMMIT');

            return res.status(201).json({
                status: "success",
                message: "Usuario registrado correctamente",
                data: {
                    codigoEmpleado: perfilInfo.codigo_empleado
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error en registerUser:', error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Error en el servidor"
        });
    }
};

export const login = async (req, res) => {
    const client = await pool.connect();
    try {
        const { codigo_empleado, password } = req.body;
        const isMobileApp = req.headers['x-app-source'] === 'mobile';

        // DEBUG: Ver qué header llega
        console.log('🔍 Headers recibidos:', {
            'x-app-source': req.headers['x-app-source'],
            'origin': req.headers.origin,
            'isMobileApp': isMobileApp
        });

        // PASO 1: Verificar que el código de empleado existe
        const result = await client.query(
            `SELECT 
                p.id AS perfil_id, 
                p.password_hash,
                p.es_admin,
                p.estado,
                p.cargo,
                per.id AS persona_id,
                per.nombre_completo,
                per.email
             FROM perfil p
             INNER JOIN persona per ON per.id = p.persona_id
             WHERE p.codigo_empleado = $1
             LIMIT 1`,
            [codigo_empleado]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Código de empleado incorrecto"
            });
        }

        const perfil = result.rows[0];

        // PASO 2: Verificar estado de la cuenta
        if (perfil.estado === 'SUSPENDIDO') {
            return res.status(403).json({
                status: 'error',
                message: 'Su cuenta está suspendida, contáctese con el administrador.'
            })
        }

        if (perfil.estado === 'BORRADO') {
            return res.status(403).json({
                status: 'error',
                message: 'Su cuenta ha sido eliminada.'
            })
        }

        // PASO 3: Validar contraseña
        const validPassword = await bcrypt.compare(password, perfil.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: "Contraseña incorrecta"
            });
        }

        // PASO 4: VERIFICAR PERMISOS SEGÚN ORIGEN
        if (!isMobileApp && !perfil.es_admin) {
            // Solo para web: requiere ser admin
            await client.query('BEGIN');
            await auditarCambio(client, {
                adminPerfilId: perfil.perfil_id,
                tabla: AUDIT_TABLES.PERFIL,
                accion: 'LOGIN_DENEGADO_NO_ADMIN',
                detalle: {
                    email: perfil.email,
                    codigo_empleado: codigo_empleado,
                    ip: req.ip || req.connection.remoteAddress,
                    razon: 'Usuario sin privilegios de administrador'
                }
            });
            await client.query('COMMIT');

            return res.status(403).json({
                error: 'ACCESO_DENEGADO',
                message: 'No tienes permisos para acceder al panel administrativo',
                codigo: 'ERR_NOT_ADMIN'
            });
        }

        // PASO 5: Generar token JWT
        const token = createToken(perfil.perfil_id);

        // Para web: establecer cookie
        if (!isMobileApp) {
            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 8 * 60 * 60 * 1000
            });
        }

        // PASO 6: Obtener geocercas asignadas (para móvil)
        let geocercas = [];
        if (isMobileApp) {
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
            geocercas = geocercasResult.rows.map(g => ({
                id: g.id,
                nombre_zona: g.nombre_zona,
                latitud: parseFloat(g.latitud),
                longitud: parseFloat(g.longitud),
                radio_metros: g.radio_metros,
                sede_nombre: g.sede_nombre
            }));
        }

        // PASO 7: Registrar login exitoso en auditoría
        await client.query('BEGIN');
        await auditarCambio(client, {
            adminPerfilId: perfil.perfil_id,
            tabla: AUDIT_TABLES.PERFIL,
            accion: isMobileApp ? 'LOGIN_MOBILE' : 'LOGIN_EXITOSO',
            detalle: {
                email: perfil.email,
                codigo_empleado: codigo_empleado,
                ip: req.ip || req.connection.remoteAddress,
                origen: isMobileApp ? 'mobile' : 'web'
            }
        });
        await client.query('COMMIT');

        // Respuesta diferente según origen
        if (isMobileApp) {
            return res.status(200).json({
                user: {
                    id: perfil.perfil_id,
                    nombre_completo: perfil.nombre_completo,
                    email: perfil.email,
                    codigo_empleado: codigo_empleado,
                    cargo: perfil.cargo,
                    rol: perfil.es_admin ? 'ADMIN' : 'USER',
                    estado: perfil.estado
                },
                token,
                geocercas
            });
        } else {
            return res.status(200).json({
                message: "Login exitoso",
                token
            });
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en login:', error);
        return res.status(500).json({
            message: "Error en el servidor"
        });
    } finally {
        client.release();
    }
};

export const logout = async (req, res) => {
    try {
        // Limpiar la cookie del token
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "Sesión cerrada exitosamente"
        });

    } catch (error) {
        console.error('Error en logout:', error);
        return res.status(500).json({
            error: "Error al cerrar sesión"
        });
    }
};

export const createUser = async (req, res) => {
    const client = await pool.connect();
    const idAdmin = req.user.id; // Del middleware auth

    try {
        const {
            nombreCompleto,
            documento,
            email,
            telefono,
            cargo,
            password
        } = req.body;

        // rol y sedeId son opcionales ahora
        const rol = req.body.rol || 'USER'; // Por defecto USER
        const sedeId = req.body.sedeId || null; // Sin sede por defecto

        // Validaciones básicas (rol y sedeId ya no son obligatorios)
        if (!nombreCompleto || !documento || !email || !cargo || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Todos los campos obligatorios deben estar completos'
            });
        }

        // Validar que el rol sea válido si se proporciona
        if (rol !== 'ADMIN' && rol !== 'USER') {
            return res.status(400).json({
                status: 'error',
                message: 'El rol debe ser ADMIN o USER'
            });
        }

        await client.query('BEGIN');

        // Verificar que el email no exista
        const emailExists = await checkEmail(client, email);
        if (emailExists) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }

        // Verificar que el documento no exista
        const documentoCheck = await client.query(
            'SELECT 1 FROM persona WHERE cedula = $1',
            [documento]
        );
        if (documentoCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                status: 'error',
                message: 'El documento de identidad ya está registrado'
            });
        }

        // Verificar que la sede exista solo si se proporciona
        if (sedeId) {
            const sedeCheck = await client.query(
                'SELECT 1 FROM sede WHERE id = $1',
                [sedeId]
            );
            if (sedeCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    status: 'error',
                    message: 'La sede seleccionada no existe'
                });
            }
        }

        // PASO 1: Crear persona
        const personaData = {
            nombreCompleto,
            cedula: documento,
            email,
            telefono: telefono || null
        };
        const personaId = await crearPersona(client, personaData);

        // PASO 2: Crear perfil con rol
        const code = generarCodigo();
        const passwordHash = await bcrypt.hash(password, 10);
        const esAdmin = (rol === 'ADMIN');

        const perfilResult = await client.query(
            `INSERT INTO perfil (
                persona_id,
                codigo_empleado,
                cargo,
                password_hash,
                es_admin,
                estado
            )
            VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
            RETURNING id, codigo_empleado`,
            [personaId, code, cargo, passwordHash, esAdmin]
        );

        const perfilId = perfilResult.rows[0].id;
        const codigoEmpleado = perfilResult.rows[0].codigo_empleado;

        // PASO 3: Asignar usuario a geocercas solo si se proporcionó sede
        if (sedeId) {
            // Obtener las geocercas de la sede
            const geocercasResult = await client.query(
                'SELECT id FROM geocerca WHERE sede_id = $1',
                [sedeId]
            );

            // Asignar usuario a todas las geocercas de la sede
            for (const geocerca of geocercasResult.rows) {
                await client.query(
                    `INSERT INTO asignacion_laboral (perfil_id, geocerca_id)
                     VALUES ($1, $2)`,
                    [perfilId, geocerca.id]
                );
            }
        }

        // PASO 4: Registrar en auditoría
        await auditarCambio(client, {
            adminPerfilId: idAdmin,
            tabla: AUDIT_TABLES.PERFIL,
            accion: AUDIT_ACTIONS.CREATE,
            detalle: {
                usuario_creado: {
                    codigo_empleado: codigoEmpleado,
                    nombre: nombreCompleto,
                    email: email,
                    rol: rol,
                    cargo: cargo,
                    sede_id: sedeId
                },
                ip: req.ip || req.connection.remoteAddress
            }
        });

        await client.query('COMMIT');

        return res.status(201).json({
            status: 'success',
            message: 'Usuario creado correctamente',
            data: {
                codigoEmpleado: codigoEmpleado,
                nombreCompleto: nombreCompleto,
                email: email,
                rol: rol
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en createUser:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Error al crear usuario'
        });
    } finally {
        client.release();
    }
};