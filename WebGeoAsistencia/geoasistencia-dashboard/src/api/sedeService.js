import api from "./axiosConfig";

export const sedeService = {
  listar: async () => {
    const res = await api.get("/sedes/list");
    return res.data;
  },

  crear: async (data) => {
    const res = await api.post("/sedes/create", data);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/sedes/delete/${id}`);
    return res.data;
  },

  obtenerPorId: async (id) => {
    const res = await api.get(`/sedes/list/${id}`);
    return res.data;
  },

  total: async () => {
    const res = await api.get("/sedes/total");
    return res.data;
  },
};
