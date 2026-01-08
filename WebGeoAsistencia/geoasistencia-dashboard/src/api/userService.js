// src/api/userService.js
import api from './axiosConfig';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  }
};