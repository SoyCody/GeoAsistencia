import api from './axiosConfig';

export const asignacionService = {
    // Obtener usuarios asignados a una geocerca
    getUsuariosGeocerca: async (geocercaId) => {
        const res = await api.get(`/asignacion/geocerca/${geocercaId}/usuarios`);
        return res.data;
    },

    // Obtener usuarios disponibles para asignar
    getUsuariosDisponibles: async (geocercaId, sedeId) => {
        const res = await api.get(`/asignacion/geocerca/${geocercaId}/disponibles?sedeId=${sedeId}`);
        return res.data;
    },

    // Asignar usuario a geocerca
    asignarUsuario: async (perfilId, geocercaId, hora_entrada, hora_salida) => {
        const res = await api.post('/asignacion/new', {
            perfilId,
            geocercaId,
            hora_entrada,
            hora_salida
        });
        return res.data;
    },

    // Remover usuario de geocerca (estableciendo horario vacío o eliminando)
    removerUsuario: async (perfilId, geocercaId) => {
        // Usamos el endpoint existente pero enviando una geocerca "null" o creamos un endpoint específico
        // Por ahora, el backend ya tiene la función removeAssign, podemos crear un endpoint DELETE
        const res = await api.delete(`/asignacion/remove/${perfilId}/${geocercaId}`);
        return res.data;
    }
};

export default asignacionService;
