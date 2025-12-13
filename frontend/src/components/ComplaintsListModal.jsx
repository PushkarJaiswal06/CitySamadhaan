import { useState, useEffect } from 'react';
import { FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { complaintService } from '../services/complaintService';
import { departmentService } from '../services/departmentService';
import ComplaintDetailModal from './ComplaintDetailModal';
import toast from 'react-hot-toast';

const ComplaintsListModal = ({ isOpen, onClose }) => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [filters, setFilters] = useState({
    status: '',
    department: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchComplaints();
    }
  }, [isOpen, filters]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getComplaints(filters);
      setComplaints(response.data.complaints || []);
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total
      });
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      department: '',
      priority: '',
      search: '',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint._id);
    setShowDetailModal(true);
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

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

          <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">My Complaints</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search complaints..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>

                  {/* Status Filter */}
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {/* Department Filter */}
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>

                  {/* Priority Filter */}
                  <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Filters
                  </button>
                  <div className="text-sm text-gray-600">
                    Showing {complaints.length} of {pagination.total} complaints
                  </div>
                </div>
              </form>
            </div>

            {/* Complaints List */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-gray-500">Loading complaints...</div>
                </div>
              ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <p>No complaints found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      onClick={() => handleComplaintClick(complaint)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">{complaint.complaintId}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            {complaint.sla?.breached && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                SLA Breached
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{complaint.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>🏢 {complaint.department?.name}</span>
                            <span>📍 {complaint.location?.address || 'No location'}</span>
                            <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {complaint.media && complaint.media.length > 0 && (
                          <img
                            src={complaint.media[0].url}
                            alt="Complaint"
                            className="w-20 h-20 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ComplaintDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        complaintId={selectedComplaint}
        onUpdate={fetchComplaints}
      />
    </>
  );
};

export default ComplaintsListModal;
