// src/api/UsuariosService.js
import api from "./axiosConfig";

export const UsuariosService = {
  /* =========================
     PERFIL
  ========================= */
  getMe: async () => {
    const res = await api.get("/user/me");
    return res.data;
  },

  /* =========================
     LISTADOS
  ========================= */
  listarActivos: async () => {
    const res = await api.get("/user/list/active");
    return res.data;
  },

  listarSuspendidos: async () => {
    const res = await api.get("/user/list/suspended");
    return res.data;
  },

  listarEliminados: async () => {
    const res = await api.get("/user/list/deleted");
    return res.data;
  },

  /* =========================
     ACCIONES ADMIN
  ========================= */
  asignarAdmin: async (id) => {
    const res = await api.put(`/user/admin/${id}`);
    return res.data;
  },

  revocarAdmin: async (id) => {
    const res = await api.put(`/user/revoke/${id}`);
    return res.data;
  },

  suspender: async (id) => {
    const res = await api.put(`/user/suspend/${id}`);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.put(`/user/delete/${id}`);
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
