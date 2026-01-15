// src/api/authService.js
import api from "./axiosConfig";

export const authService = {
  login: async (codigo_empleado, password) => {
    const response = await api.post("/auth/login", {
      codigo_empleado,
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
