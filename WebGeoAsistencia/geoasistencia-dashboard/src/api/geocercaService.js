import api from "./axiosConfig";

export const geocercaService = {
  // LISTAR geocercas por sede
  listarPorSede: async (sedeId) => {
    const res = await api.get(`/geocerca/list/${sedeId}`);
    return res.data;
  },

  // CREAR geocerca
  crear: async (data) => {
    const res = await api.post("/geocerca/create", data);
    return res.data;
  },

  // ELIMINAR geocerca
  eliminar: async (id) => {
    const res = await api.delete(`/geocerca/delete/${id}`);
    return res.data;
  },

  // OBTENER geocerca por ID
  obtenerPorId: async (id) => {
    const res = await api.get(`/geocerca/watch/${id}`);
    return res.data;
  },

  // ACTUALIZAR geocerca
  actualizar: async (id, data) => {
    const res = await api.put(`/geocerca/update/${id}`, data);
    return res.data;
  },

  // LISTAR usuarios por geocerca (YA EXISTE EN BACKEND)
  listarUsuarios: async (geocercaId) => {
    const res = await api.get(`/geocerca/users/${geocercaId}`);
    return res.data;
  }
};
export default geocercaService;