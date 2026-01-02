import validator from 'validator';

export function validateCoordenadas(latitud, longitud) {

    const latStr = (latitud !== undefined && latitud !== null) ? String(latitud).trim() : '';
    const lonStr = (longitud !== undefined && longitud !== null) ? String(longitud).trim() : '';

    if (validator.isEmpty(latStr)) {
        throw new Error("La latitud es obligatoria.");
    }
    if (validator.isEmpty(lonStr)) {
        throw new Error("La longitud es obligatoria.");
    }

    // isFloat verifica que sea numérico Y que esté en el rango
    if (!validator.isFloat(latStr, { min: -90, max: 90 })) {
        throw new Error("La latitud inválida. Debe estar entre -90 y 90.");
    }

    if (!validator.isFloat(lonStr, { min: -180, max: 180 })) {
        throw new Error("La longitud inválida. Debe estar entre -180 y 180.");
    }

    // Importante: PostGIS necesita números reales, no strings.
    return {
        latitud: parseFloat(latStr),
        longitud: parseFloat(lonStr)
    };
}