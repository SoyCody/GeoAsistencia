// Script para modificar auth.controller.js y permitir login móvil
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../modules/auth/auth.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y reemplazar la sección de validación de admin
const searchPattern = /\/\/ PASO 4: VERIFICAR PERMISOS DE ADMINISTRADOR\s+if \(!perfil\.es_admin\) \{[\s\S]*?\}\)/;

const replacement = `// PASO 4: VERIFICAR PERMISOS SEGÚN ORIGEN
        const isMobileApp = req.headers['x-app-source'] === 'mobile';
        
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
        }`;

content = content.replace(searchPattern, replacement);

// Guardar
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Archivo actualizado');
