import api from './api';

export const userService = {
  // Get all users with filters
  async getUsers(params = {}) {
    return api.get('/users', { params });
  },

  // Get single user
  async getUser(id) {
    return api.get(`/users/${id}`);
  },

  // Create new user
  async createUser(userData) {
    return api.post('/users', userData);
  },

  // Update user
  async updateUser(id, userData) {
    return api.patch(`/users/${id}`, userData);
  },

  // Delete user (soft delete)
  async deleteUser(id) {
    return api.delete(`/users/${id}`);
  },

  // Get field workers for assignment
  async getFieldWorkers(departmentId = null) {
    const params = departmentId ? { department: departmentId } : {};
    return api.get('/users/field-workers', { params });
  },

  // Get user statistics
  async getUserStats() {
    return api.get('/users/stats');
  }
};

export default userService;
