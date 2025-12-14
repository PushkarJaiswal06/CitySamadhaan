import api from './api';

// ==================== PROPERTY SERVICES ====================

// Register a new property
export const registerProperty = async (propertyData) => {
  const response = await api.post('/land/properties', propertyData);
  return response.data;
};

// Get all properties (with filters)
export const getProperties = async (params = {}) => {
  const response = await api.get('/land/properties', { params });
  return response.data;
};

// Get single property by ID
export const getPropertyById = async (id) => {
  const response = await api.get(`/land/properties/${id}`);
  return response.data;
};

// Verify property publicly (no auth required)
export const verifyProperty = async (params) => {
  const response = await api.get('/land/properties/verify', { params });
  return response.data;
};

// Upload document to property
export const uploadPropertyDocument = async (propertyId, file, documentType, documentName) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  formData.append('documentName', documentName || file.name);
  
  const response = await api.post(`/land/properties/${propertyId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Verify property by official
export const verifyPropertyByOfficial = async (propertyId, verificationData) => {
  const response = await api.put(`/land/properties/${propertyId}/verify`, verificationData);
  return response.data;
};

// ==================== TRANSFER SERVICES ====================

// Initiate land transfer
export const initiateTransfer = async (transferData) => {
  const response = await api.post('/land/transfers', transferData);
  return response.data;
};

// Get all transfers
export const getTransfers = async (params = {}) => {
  const response = await api.get('/land/transfers', { params });
  return response.data;
};

// Get transfer statistics
export const getTransferStats = async () => {
  const response = await api.get('/land/transfers/stats');
  return response.data;
};

// Get single transfer by ID
export const getTransferById = async (id) => {
  const response = await api.get(`/land/transfers/${id}`);
  return response.data;
};

// Update transfer stage
export const updateTransferStage = async (transferId, stageData) => {
  const response = await api.put(`/land/transfers/${transferId}/stage`, stageData);
  return response.data;
};

// Upload transfer document
export const uploadTransferDocument = async (transferId, file, documentType, documentName) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  formData.append('documentName', documentName || file.name);
  
  const response = await api.post(`/land/transfers/${transferId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Approve transfer stage (for officials)
export const approveTransferStage = async (transferId, approvalData) => {
  const response = await api.put(`/land/transfers/${transferId}/approve`, approvalData);
  return response.data;
};

// Cancel transfer
export const cancelTransfer = async (transferId, reason) => {
  const response = await api.post(`/land/transfers/${transferId}/cancel`, { reason });
  return response.data;
};

export default {
  // Properties
  registerProperty,
  getProperties,
  getPropertyById,
  verifyProperty,
  uploadPropertyDocument,
  verifyPropertyByOfficial,
  
  // Transfers
  initiateTransfer,
  getTransfers,
  getTransferStats,
  getTransferById,
  updateTransferStage,
  uploadTransferDocument,
  approveTransferStage,
  cancelTransfer
};
