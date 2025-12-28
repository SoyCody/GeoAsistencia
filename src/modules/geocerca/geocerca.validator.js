import validator from 'validator';

export async function validateGeo(body) {

    const sede_id = (body.sede_id || '').toString().trim();
    const nombre_zona = (body.nombre_zona || '').toString().trim();
        
    const latStr = (body.latitud !== undefined && body.latitud !== null) ? String(body.latitud).trim() : '';
    const lonStr = (body.longitud !== undefined && body.longitud !== null) ? String(body.longitud).trim() : '';
    const radioStr = (body.radio_metros !== undefined && body.radio_metros !== null) ? String(body.radio_metros).trim() : '';

    if (validator.isEmpty(sede_id)) {
        throw new Error("El ID de la sede es obligatorio.");
    }
    
    if (!validator.isUUID(sede_id)) {
        throw new Error("El ID de la sede no es un UUID válido.");
    }

    if (validator.isEmpty(nombre_zona)) {
        throw new Error("El nombre de la zona es obligatorio.");
    }

    if (validator.isEmpty(latStr)) {
        throw new Error("La latitud es obligatoria.");
    }
    if (!validator.isFloat(latStr, { min: -90, max: 90 })) {
        throw new Error("La latitud debe ser un número entre -90 y 90.");
    }

    if (validator.isEmpty(lonStr)) {
        throw new Error("La longitud es obligatoria.");
    }
    if (!validator.isFloat(lonStr, { min: -180, max: 180 })) {
        throw new Error("La longitud debe ser un número entre -180 y 180.");
    }

    let radioFinal = 50; // Valor por defecto

    if (!validator.isEmpty(radioStr)) {
        if (!validator.isFloat(radioStr, { min: 1 })) { 
            throw new Error("El radio debe ser un número positivo mayor a 0.");
        }
        radioFinal = parseFloat(radioStr);
    }

    return {
        sede_id,
        nombre_zona,
        latitud: parseFloat(latStr),
        longitud: parseFloat(lonStr),
        radio_metros: radioFinal
    };
}

export async function validateUpd(body) {
    const nombre_zona = (body.nombre_zona || '').toString().trim();
    const latStr = (body.latitud !== undefined && body.latitud !== null) ? String(body.latitud).trim() : '';
    const lonStr = (body.longitud !== undefined && body.longitud !== null) ? String(body.longitud).trim() : '';
    const radioStr = (body.radio_metros !== undefined && body.radio_metros !== null) ? String(body.radio_metros).trim() : '';

    if (validator.isEmpty(nombre_zona)) {
        throw new Error("El nombre de la zona es obligatorio.");
    }

    if (validator.isEmpty(latStr)) {
        throw new Error("La latitud es obligatoria.");
    }
    if (!validator.isFloat(latStr, { min: -90, max: 90 })) {
        throw new Error("La latitud debe ser un número entre -90 y 90.");
    }

    if (validator.isEmpty(lonStr)) {
        throw new Error("La longitud es obligatoria.");
    }
    if (!validator.isFloat(lonStr, { min: -180, max: 180 })) {
        throw new Error("La longitud debe ser un número entre -180 y 180.");
    }

    let radioFinal = 50; 

    if (!validator.isEmpty(radioStr)) {
        if (!validator.isFloat(radioStr, { min: 1 })) { 
            throw new Error("El radio debe ser un número positivo mayor a 0.");
        }
        radioFinal = parseFloat(radioStr);
    }

    return {
        nombre_zona,
        latitud: parseFloat(latStr),
        longitud: parseFloat(lonStr),
        radio_metros: radioFinal
    }
};
