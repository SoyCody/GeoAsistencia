import axiosInstance from './axiosConfig';

export const registroService = {
    // Obtener estadísticas de asistencias del día
    async getEstadisticasHoy() {
        const response = await axiosInstance.get('/registro/estadisticas');
        return response.data;
    },

    async getTodayCount() {
        const response = await axiosInstance.get('/registro/total');
        return response.data;
    },

    async getAtrasos() {
        const response = await axiosInstance.get('/registro/atrasos');
        return response.data;
    },
};

export default registroService;
