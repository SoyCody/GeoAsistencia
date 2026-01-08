// src/api/authService.js
import api from "./axiosConfig";

export const authService = {
  login: async (codigo, password) => {
    const response = await api.post("/auth/login", {
      codigo,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
