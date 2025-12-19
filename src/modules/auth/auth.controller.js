import { validateUser } from './auth.validator.js';
import { crearPersona, crearPerfil, checkEmail } from './auth.repository.js';
import { pool } from '../../config/db.js';
import { generarCodigo } from './auth.utils.js';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/jwt.js';

export const registerUser = async (req, res) => {
    try {
        const { persona, perfil } = validateUser(req.body);
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const emailExists = await checkEmail(client, persona.email);
            if (emailExists) {
                await client.query(`ROLLBACK`);
                return res.status(400).json({
                    status: 'error',
                    message: 'El email ya está registrado'
                });
            };

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

            await crearPerfil(client, perfilData);

            await client.query('COMMIT');
            return res.status(201).json({
                status: "success",
                message: "Usuario registrado correctamente",
                data: {
                    codigoEmpleado: code
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Error en el servidor"
        })
    }

};

export const login = async (req, res) => {
    const { codigo_empleado, password } = req.body;

    const result = await pool.query(
        `
            SELECT 
            p.id AS perfil_id, p.password_hash
            FROM perfil p
            WHERE p.codigo_empleado = $1
            LIMIT 1
        `,
        [codigo_empleado]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({ message: "Codigo incorrecto" })
    };

    const perfil = result.rows[0];

    const validPassword = await bcrypt.compare(password, perfil.password_hash);
    if (!validPassword) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = createToken(perfil.perfil_id);
    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60 * 1000
    });

    return res.status(200).json({
        message: "Login exitoso",
        token
    })
};