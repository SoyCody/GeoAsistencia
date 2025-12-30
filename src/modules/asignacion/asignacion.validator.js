import validator from 'validator';

export function validatePerfil(perfilId){
    const perfil = `SELECT * FROM perfil WHERE id = $1`;
    return perfil;
}