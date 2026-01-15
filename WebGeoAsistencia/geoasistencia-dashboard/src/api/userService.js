import api from './axiosConfig';

export const userService = {

  /* =====================
     PERFIL PROPIO
  ===================== */
  getMe: async () => {
    const res = await api.get('/user/me');
    return res.data;
  },

  /* =====================
     LISTADOS
  ===================== */
  getActiveUsers: async () => {
    const res = await api.get('/user/list/active');
    return res.data;
  },

  getSuspendedUsers: async () => {
    const res = await api.get('/user/list/suspended');
    return res.data;
  },

  getDeletedUsers: async () => {
    const res = await api.get('/user/list/deleted');
    return res.data;
  },

  /* =====================
     USUARIO INDIVIDUAL
  ===================== */
  getUserById: async (id) => {
    const res = await api.get(`/user/watch/${id}`);
    return res.data;
  },

  /* =====================
     ACCIONES ADMIN
  ===================== */
  updateUser: async (id, userData) => {
    const res = await api.put(`/user/update/${id}`, userData);
    return res.data;
  },

  suspendUser: async (id) => {
    const res = await api.put(`/user/suspend/${id}`);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.put(`/user/delete/${id}`);
    return res.data;
  },

  assignAdmin: async (id) => {
    const res = await api.put(`/user/admin/${id}`);
    return res.data;
  },

  revokeAdmin: async (id) => {
    const res = await api.put(`/user/revoke/${id}`);
    return res.data;
  },

  /* =========================
     CONTADORES
  ========================= */
  total: async () => {
    const res = await api.get("/user/total");
    return res.data;
  },

  totalActivos: async () => {
    const res = await api.get("/user/actives");
    return res.data;
  },

  totalSuspendidos: async () => {
    const res = await api.get("/user/suspended");
    return res.data;
  },

  totalEliminados: async () => {
    const res = await api.get("/user/deleted");
    return res.data;
  },
};