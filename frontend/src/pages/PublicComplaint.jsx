import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { departmentService } from '../services/departmentService';

const PublicComplaint = () => {
  const [formData, setFormData] = useState({
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    title: '',
    description: '',
    departmentId: '',
    category: '',
    location: {
      address: '',
      area: '',
      wardNumber: '',
      city: 'Bhopal',
      pincode: '',
      coordinates: { type: 'Point', coordinates: [77.4126, 23.2599] } // Default Bhopal
    }
  });

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      console.log('Loading departments...');
      const response = await departmentService.getDepartments();
      console.log('Departments response:', response);
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
      console.error('Error details:', err.response?.data || err.message);
    }
  };

  const loadCategories = async (deptId) => {
    try {
      console.log('Loading categories for department:', deptId);
      const response = await departmentService.getDepartmentCategories(deptId);
      console.log('Categories response:', response);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      console.error('Error details:', err.response?.data || err.message);
    }
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData({ ...formData, departmentId: deptId, category: '' });
    loadCategories(deptId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await complaintService.createPublicComplaint(formDataToSend);
      
      setSuccess({
        message: response.message,
        complaintId: response.trackingId
      });

      // Reset form
      setFormData({
        citizenName: '',
        citizenPhone: '',
        citizenEmail: '',
        title: '',
        description: '',
        departmentId: '',
        category: '',
        location: {
          address: '',
          area: '',
          wardNumber: '',
          city: 'Bhopal',
          pincode: '',
          coordinates: { type: 'Point', coordinates: [77.4126, 23.2599] }
        }
      });
      setImages([]);

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CitySamdhaan 🏛️
          </h1>
          <p className="text-xl text-gray-600">
            File Your Complaint - No Registration Required
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ✅ Blockchain Verified | 🔍 Public Tracking | 🚀 Fast Resolution
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-green-800">
                  Complaint Submitted Successfully! ✅
                </h3>
                <p className="text-green-700 mt-2">{success.message}</p>
                <div className="mt-4 bg-white p-4 rounded border-2 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Your Complaint ID:</p>
                  <p className="text-2xl font-mono font-bold text-green-600 tracking-wider">
                    {success.complaintId}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    📝 Save this ID to track your complaint
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href={`/track/${success.complaintId}`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Track Your Complaint →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📞 Your Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.citizenName}
                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.citizenPhone}
                    onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.citizenEmail}
                    onChange={(e) => setFormData({ ...formData, citizenEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📝 Complaint Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="200"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    maxLength="2000"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide detailed information about your complaint..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.departmentId}
                      onChange={handleDepartmentChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.departmentId}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📍 Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address or landmark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={formData.location.area}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, area: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Area or locality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                  <input
                    type="text"
                    value={formData.location.wardNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, wardNumber: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ward number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    pattern="[0-9]{6}"
                    value={formData.location.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, pincode: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📷 Upload Images (Optional)
              </h2>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                You can upload up to 5 images (max 5MB each)
              </p>
              {images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    ✓ {images.length} image(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  '🚀 Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            🔍 Already have a complaint ID?{' '}
            <a href="/track" className="text-blue-600 hover:underline font-semibold">
              Track Your Complaint
            </a>
          </p>
          <p className="text-sm text-gray-500">
            All complaints are anchored on Ethereum blockchain for transparency
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicComplaint;
