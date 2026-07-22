// src/modules/usuarios/services/users.service.js
import api from '../../../services/api';

export const usersService = {
  // 1. Listar usuarios con filtro de estado
  //    filtro: 'TODOS' | 'ACTIVOS' | 'PENDIENTES' | 'RECHAZADOS'
  getAll: async (filtro = 'TODOS') => {
    try {
      const params = filtro && filtro !== 'TODOS' ? `?filtro=${filtro}` : '';
      const response = await api.get(`/usuarios${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en usersService.getAll:', error);
      throw error;
    }
  },

  // 2. Detalle de un usuario específico
  getById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.getById para ID ${id}:`, error);
      throw error;
    }
  },

  // 3. Crear usuario (desde el panel Admin - flujo original con rol asignado)
  create: async (userData) => {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error('Error en usersService.create:', error);
      throw error;
    }
  },

  // 4. Actualizar usuario (editar datos)
  update: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.update para ID ${id}:`, error);
      throw error;
    }
  },

  // 5. Auto-registro público (solo username + password → queda PENDIENTE)
  registrar: async (datos) => {
    try {
      const response = await api.post('/usuarios/registro', datos);
      return response.data;
    } catch (error) {
      console.error('Error en usersService.registrar:', error);
      throw error;
    }
  },

  // 6. Aprobar usuario pendiente (asigna rol y proveedor)
  aprobar: async (id, datos) => {
    try {
      const response = await api.put(`/usuarios/${id}/aprobar`, datos);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.aprobar para ID ${id}:`, error);
      throw error;
    }
  },

  // 7. Rechazar usuario pendiente
  rechazar: async (id) => {
    try {
      const response = await api.put(`/usuarios/${id}/rechazar`);
      return response.data;
    } catch (error) {
      console.error(`Error en usersService.rechazar para ID ${id}:`, error);
      throw error;
    }
  }
};