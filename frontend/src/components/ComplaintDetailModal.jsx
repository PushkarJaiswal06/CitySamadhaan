import { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaUser, FaMapMarkerAlt, FaImage, FaStar } from 'react-icons/fa';
import { complaintService } from '../services/complaintService';
import toast from 'react-hot-toast';

const ComplaintDetailModal = ({ isOpen, onClose, complaintId, onUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails();
    }
  }, [isOpen, complaintId]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getComplaint(complaintId);
      setComplaint(response.data);
    } catch (error) {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedback.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      await complaintService.addFeedback(complaintId, feedback);
      toast.success('Feedback submitted successfully');
      setShowFeedback(false);
      fetchComplaintDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Complaint Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : complaint ? (
              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">{complaint.complaintId}</span>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  {complaint.sla?.breached && (
                    <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                      SLA Breached
                    </span>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{complaint.title}</h4>
                  <p className="text-gray-700">{complaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{complaint.department?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{complaint.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Filed On</p>
                    <p className="font-medium text-gray-900">{new Date(complaint.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{new Date(complaint.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Location */}
                {complaint.location?.address && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mb-1">
                      <FaMapMarkerAlt /> <span>Location</span>
                    </p>
                    <p className="font-medium text-gray-900">{complaint.location.address}</p>
                    {complaint.location.landmark && (
                      <p className="text-sm text-gray-600">Near: {complaint.location.landmark}</p>
                    )}
                    {complaint.location.wardNumber && (
                      <p className="text-sm text-gray-600">Ward: {complaint.location.wardNumber}</p>
                    )}
                  </div>
                )}

                {/* Assigned Worker */}
                {complaint.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mb-1">
                      <FaUser /> <span>Assigned To</span>
                    </p>
                    <p className="font-medium text-gray-900">{complaint.assignedTo.name}</p>
                    <p className="text-sm text-gray-600">{complaint.assignedTo.phone}</p>
                  </div>
                )}

                {/* Images */}
                {complaint.media && complaint.media.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mb-2">
                      <FaImage /> <span>Attachments</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {complaint.media.map((media, idx) => (
                        <img
                          key={idx}
                          src={media.url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History/Timeline */}
                {complaint.statusHistory && complaint.statusHistory.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mb-3">
                      <FaClock /> <span>Status Timeline</span>
                    </p>
                    <div className="space-y-3">
                      {complaint.statusHistory.map((history, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{history.status}</p>
                            <p className="text-xs text-gray-500">{new Date(history.timestamp).toLocaleString()}</p>
                            {history.comment && (
                              <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                            )}
                            {history.changedBy && (
                              <p className="text-xs text-gray-500">By: {history.changedBy.name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {complaint.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm font-medium text-green-800 mb-1">Resolution</p>
                    <p className="text-sm text-green-900">{complaint.resolution.description}</p>
                    {complaint.resolution.resolvedAt && (
                      <p className="text-xs text-green-700 mt-1">
                        Resolved on: {new Date(complaint.resolution.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback Section */}
                {(complaint.status === 'resolved' || complaint.status === 'closed') && !complaint.feedback && !showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-300 rounded-md hover:bg-primary-100"
                  >
                    Rate This Service
                  </button>
                )}

                {showFeedback && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Rate Your Experience</h4>
                    <div className="flex items-center space-x-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <FaStar
                            className={`w-6 h-6 ${
                              star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedback.comment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your feedback (optional)"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFeedbackSubmit}
                        className="px-3 py-1 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                )}

                {complaint.feedback && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Your Feedback</p>
                    <div className="flex items-center space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= complaint.feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {complaint.feedback.comment && (
                      <p className="text-sm text-yellow-900 mt-2">{complaint.feedback.comment}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">Complaint not found</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
