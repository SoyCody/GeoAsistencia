import { validateUser } from './user.validator.js';
import { crearPersona, crearPerfil } from './user.repository.js';
import { pool } from '../../config/db.js';
import { generarCodigo } from './user.utils.js';
import bcrypt from 'bcrypt';

export const registerUser = async(req, res)=>{
    try {
        const { persona, perfil } = validateUser(req.body);
        const client = await pool.connect();
        
        try{
            await client.query('BEGIN');
            
            const emailExists = await checkEmail(client, persona.email);
            if(!emailExists){
                await client.query(`ROLLBACK`);
                return res.status(400),json({
                    status:'error',
                    message:'El email ya está registrado'
                })
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

        }catch(error){
            await client.query('ROLLBACK');
            throw error;
        }finally{
            client.release();
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            status:"error",
            message: error.message || "Error en el servidor"   
        })
    }

};
