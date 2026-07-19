// src/modules/usuarios/services/users.service.js
import api from '../../../services/api'; 
// Nota: Los "../../.." suben tres niveles desde services -> usuarios -> modules -> src/services/api

export const usersService = {
  // 1. Listar todos los usuarios (Útil para tu rol de Admin)
  getAll: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error("Error en usersService.getAll:", error);
      throw error;
    }
  },
  
  // 2. Visualizar el detalle de un usuario específico (Para tu rol de Consulta y Admin)
  getById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.getById para ID ${id}:`, error);
      throw error;
    }
  },

  // 3. Crear nuevos usuarios con sus respectivos roles (Admin, Proveedor)
  create: async (userData) => {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error("Error en usersService.create:", error);
      throw error;
    }
  },

  // 4. Actualizar la información del usuario y su estado de edición (H / L)
  update: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.update para ID ${id}:`, error);
      throw error;
    }
  }
};