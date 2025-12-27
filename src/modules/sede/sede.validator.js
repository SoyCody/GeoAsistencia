import validator from 'validator';

export function validateSede(body){
    const nombre = (body.nombre || '').toString().trim();
    const direccion = (body.direccion || '').toString().trim();
    const lat = String(body.latitud || '').trim();
    const long = String(body.longitud || '').trim();

    if(validator.isEmpty(nombre)){
        throw new Error('El nombre es obligatorio');
    }

    if(validator.isEmpty(direccion)){
        throw new Error('La dirección es obligatoria');
    }

    if(validator.isEmpty(lat)){
        throw new Error('La latitud es obligatoria');
    }

    if(!validator.isFloat(lat, { min: -90, max: 90 })){
        throw new Error('La latitud debe ser un número válido entre -90 y 90.');
    }

    if(validator.isEmpty(long)){
        throw new Error('La longitud es obligatoria');
    }   
    if(!validator.isFloat(long, { min: -180, max: 180 })){
        throw new Error('La longitud debe ser un número válido entre -180 y 180.');
    }

    const latitud = parseFloat(lat);
    const longitud = parseFloat(long);

    const sede = {
        nombre,
        direccion,
        latitud,
        longitud
    };
    return sede;
}