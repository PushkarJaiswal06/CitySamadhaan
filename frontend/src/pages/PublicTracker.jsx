import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';

const PublicTracker = () => {
  const { complaintId: urlComplaintId } = useParams();
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState(urlComplaintId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlComplaintId) {
      fetchComplaint(urlComplaintId);
    }
  }, [urlComplaintId]);

  const fetchComplaint = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await complaintService.trackComplaint(id);
      setComplaint(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found. Please check your complaint ID.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (complaintId.trim()) {
      navigate(`/track/${complaintId.trim()}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      assigned: '👤',
      in_progress: '🔧',
      resolved: '✅',
      closed: '📋',
      rejected: '❌'
    };
    return icons[status] || '📝';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 Track Your Complaint
          </h1>
          <p className="text-lg text-gray-600">
            Enter your complaint ID to check the status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g., CSB-2024-00001)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Complaint Details */}
        {complaint && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">
                  {complaint.complaintId}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {complaint.title}
                    </h3>
                    <p className="text-gray-600">{complaint.description}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-full border-2 ${getStatusColor(complaint.status)}`}>
                    <span className="text-2xl mr-2">{getStatusIcon(complaint.status)}</span>
                    <span className="font-semibold text-lg capitalize">
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-semibold text-gray-900">
                      {complaint.department?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">
                      {complaint.category?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-semibold text-gray-900">
                      {complaint.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Filed On</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                  {complaint.location && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {complaint.location.address}
                        {complaint.location.area && `, ${complaint.location.area}`}
                        {complaint.location.city && `, ${complaint.location.city}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Blockchain Verification */}
                {complaint.blockchainHash && (
                  <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔗</span>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800 mb-1">
                          Blockchain Verified ✅
                        </p>
                        <p className="text-sm text-green-700">
                          This complaint is anchored on Ethereum blockchain for transparency
                        </p>
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${complaint.blockchainHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        View on Etherscan →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            {complaint.updates && complaint.updates.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  📅 Status Timeline
                </h3>
                <div className="space-y-4">
                  {complaint.updates.map((update, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-10 h-10 rounded-full ${getStatusColor(update.status)} flex items-center justify-center text-xl`}>
                          {getStatusIcon(update.status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 capitalize">
                            {update.status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(update.timestamp)}
                          </p>
                        </div>
                        {update.comment && (
                          <p className="text-gray-600 mt-1">{update.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {complaint.media && complaint.media.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  📷 Attachments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.media.map((item, index) => (
                    <img
                      key={index}
                      src={item.url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(item.url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {complaint.resolution && (
              <div className="bg-green-50 border-2 border-green-500 shadow-lg rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-4">
                  ✅ Resolution Details
                </h3>
                <p className="text-gray-700 mb-2">{complaint.resolution.remarks}</p>
                <p className="text-sm text-gray-600">
                  Resolved on: {formatDate(complaint.resolution.resolvedAt)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Need to file a new complaint?{' '}
            <a href="/complaint" className="text-blue-600 hover:underline font-semibold">
              Click here
            </a>
          </p>
          <p className="text-sm text-gray-500">
            For assistance, contact: support@citysamadhaan.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTracker;
