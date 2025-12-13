import api from './api';

export const complaintService = {
  // Create complaint
  createComplaint: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  // Get all complaints (with filters)
  getComplaints: async (filters = {}) => {
    const response = await api.get('/complaints', { params: filters });
    return response.data;
  },

  // Get single complaint
  getComplaint: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Update complaint status
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/complaints/${id}/status`, statusData);
    return response.data;
  },

  // Assign complaint
  assignComplaint: async (id, assignedTo) => {
    const response = await api.patch(`/complaints/${id}/assign`, { assignedTo });
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/complaints/stats');
    return response.data;
  }
};
