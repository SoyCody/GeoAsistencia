import { consultaAdmin } from './user.repository.js';
import validator from "validator";

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

/**
 * Validación mínima para actualización de usuario
 */
export const validateUpdateUser = (data) => {
  const errors = [];

  const email = data.email?.trim();
  const telefono = data.telefono?.trim();
  const cargo = data.cargo?.trim();

  if (!email) {
    errors.push("El email es obligatorio");
  } else if (!validator.isEmail(email)) {
    errors.push("El email no tiene un formato válido");
  }

  if (!telefono) {
    errors.push("El número telefónico es obligatorio");
  } else if (!/^[0-9+\s-]{7,20}$/.test(telefono)) {
    errors.push("El número telefónico no es válido");
  }

  if (!cargo) {
    errors.push("El cargo es obligatorio");
  } else if (cargo.length < 3 || cargo.length > 50) {
    errors.push("El cargo debe tener entre 3 y 50 caracteres");
  }

  if (errors.length > 0) {
    const error = new Error("Error de validación");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return {
    email,
    telefono,
    cargo
  };
};
