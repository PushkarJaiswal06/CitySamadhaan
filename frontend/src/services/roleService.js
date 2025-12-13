import api from './api';

export const roleService = {
  // Get all roles
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get single role
  getRole: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  }
};
