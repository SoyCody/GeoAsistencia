import validator from 'validator';

export function validateUser(body) {

    // Sanitizar y normalizar
    const nombre_completo = (body.nombre_completo || '').toString().trim();
    const cedula = String(body.cedula || '').trim();
    const email = (body.email || '').toString().trim().toLowerCase();
    const telefono = String(body.telefono || '').trim();

    const cargo = (body.cargo || '').toString().trim();
    const password = (body.password || '').toString().trim();

    // Validar campos obligatorios

    if (validator.isEmpty(nombre_completo)) {
        throw new Error("El nombre es obligarotio")
    };

    if (validator.isEmpty(cedula)) {
        throw new Error("La cédula es obligatoria")
    };

    if (validator.isEmpty(email)) {
        throw new Error("El email es obligatorio")
    };

    if (!validator.isEmail(email)) {
        throw new Error("El formato del correo electrónico no es válido.");
    };

    // teléfono: admitir solo dígitos (sin +)

    if (validator.isEmpty(telefono)) {
        throw new Error("El número de teléfono es obligatorio")
    };
    const digitsOnly = telefono.replace(/[^\d]/g, "");
    if (!validator.isLength(digitsOnly, { min: 9, max: 10 })) {
        throw new Error("El número de teléfono debe tener entre 9 y 10 dígitos.");
    }
    if (!validator.isInt(digitsOnly)) {
        throw new Error("El número de teléfono debe ser numérico.");
    }

    if (validator.isEmpty(cargo)) {
        throw new Error("El cargo es obligatorio")
    };

    if (validator.isEmpty(password)) {
        throw new Error("La contraseña no puede estar vacía.");
    };

    if (!validator.isLength(password, { min: 8 })) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
    };


    if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/)) {
        throw new Error("La contraseña debe incluir letras, números y un símbolo especial.");
    };

    // Separar datos para cada tabla
    const persona = {
        nombreCompleto: nombre_completo,
        cedula,
        email,
        telefono
    };

    const perfil = {
        cargo,
        password
    };

    return {
        persona,
        perfil
    };
}