import api from './api';

export const departmentService = {
  // Get all departments
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  // Get single department
  getDepartment: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Get department categories
  getDepartmentCategories: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/categories`);
    return response.data;
  }
};
