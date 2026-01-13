import api from "./axiosConfig";

const sedeService = {
  listar: async () => {
    const res = await api.get("/sede/list");
    return res.data;
  },

  crear: async (data) => {
    const res = await api.post("/sede/create", data);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.delete(`/sede/delete/${id}`);
    return res.data;
  },

  obtenerPorId: async (id) => {
    const res = await api.get(`/sede/list/${id}`);
    return res.data;
  },

  total: async () => {
    const res = await api.get("/sede/total");
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/sede/update/${id}`, data);
    return res.data;
  },

  users: async (id) => {
    const res = await api.get(`/sede/users/${id}`);
    return res.data;
  },
};

export default sedeService;