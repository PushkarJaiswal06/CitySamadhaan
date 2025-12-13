import api from './api';

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get categories by department
  getCategoriesByDepartment: async (departmentId) => {
    const response = await api.get(`/categories?department=${departmentId}`);
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }
};
