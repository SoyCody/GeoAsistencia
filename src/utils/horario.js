import validator from 'validator';

export function validateHorario(hora_entrada, hora_salida) {

    const entrada = (hora_entrada || '').toString().trim();
    const salida = (hora_salida || '').toString().trim();

    if (validator.isEmpty(entrada)) {
        throw new Error("La hora de entrada es obligatoria.");
    }
    if (validator.isEmpty(salida)) {
        throw new Error("La hora de salida es obligatoria.");
    }

    // Explicación Regex: 
    // ^([01]\d|2[0-3]) -> Acepta 00-19 o 20-23
    // :([0-5]\d)$      -> Acepta :00-59
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!validator.matches(entrada, timeRegex)) {
        throw new Error("La hora de entrada debe tener el formato HH:MM (ej: 08:30).");
    }
    if (!validator.matches(salida, timeRegex)) {
        throw new Error("La hora de salida debe tener el formato HH:MM (ej: 17:00).");
    }

    // Al ser formato HH:MM (24h), podemos compararlos directamente como strings
    // Ejemplo: "08:00" < "17:00" es TRUE.

    if (entrada >= salida) {
        throw new Error("La hora de salida debe ser posterior a la hora de entrada.");
    }

    return {
        hora_entrada: entrada,
        hora_salida: salida
    };
}