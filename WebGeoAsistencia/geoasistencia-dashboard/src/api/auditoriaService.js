import api from "./axiosConfig";

export const auditoriaService = {
    getAuditorias: async () => {
        const response = await api.get("/auditoria");
        return response.data;
    },
};
