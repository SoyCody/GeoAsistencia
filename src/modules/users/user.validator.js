import { consultaAdmin } from './user.repository.js';

export const isUserAdmin = async (client, id) => {
  try {
    const result = await consultaAdmin(client, id);

    // Si no existe el usuario o está inactivo, retorna false
    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].es_admin === true;

  } catch (error) {
    console.error('Error al verificar si el usuario es admin:', error);
    throw new Error('Error al verificar privilegios de administrador');
  }
};