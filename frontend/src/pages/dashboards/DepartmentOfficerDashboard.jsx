import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import {
  FaSignOutAlt,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaUserPlus,
  FaEye,
  FaTasks
} from 'react-icons/fa';

const DepartmentOfficerDashboard = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchData();
    fetchFieldWorkers();
  }, []);

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab, filters]);

  const fetchData = async () => {
    try {
      const { data } = await complaintService.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const params = {
        department: user?.department?._id,
        ...filters
      };
      Object.keys(params).forEach(key => params[key] === '' && delete params[key]);
      
      const { data } = await complaintService.getComplaints(params);
      setComplaints(data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    }
  };

  const fetchFieldWorkers = async () => {
    try {
      const { data } = await userService.getFieldWorkers(user?.department?._id);
      setFieldWorkers(data);
    } catch (error) {
      console.error('Failed to fetch field workers:', error);
    }
  };

  const handleAssignComplaint = async (complaintId, fieldWorkerId) => {
    try {
      await complaintService.assignComplaint(complaintId, fieldWorkerId);
      toast.success('Complaint assigned successfully');
      setShowAssignModal(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to assign complaint');
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus, comment) => {
    try {
      await complaintService.updateStatus(complaintId, {
        status: newStatus,
        comment
      });
      toast.success('Status updated successfully');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Officer Dashboard</h1>
              <p className="text-sm text-gray-600">
                {user?.department?.name} • {user?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Complaints"
            value={complaints.length}
            icon={<FaFileAlt className="text-3xl text-blue-600" />}
          />
          <StatCard
            title="Pending"
            value={complaints.filter(c => c.status === 'pending').length}
            icon={<FaClock className="text-3xl text-yellow-600" />}
          />
          <StatCard
            title="In Progress"
            value={complaints.filter(c => c.status === 'in_progress').length}
            icon={<FaTasks className="text-3xl text-purple-600" />}
          />
          <StatCard
            title="Resolved"
            value={complaints.filter(c => c.status === 'resolved').length}
            icon={<FaCheckCircle className="text-3xl text-green-600" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Workers</option>
              {fieldWorkers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Department Complaints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.complaintId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {complaint.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowAssignModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Assign
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Assign Complaint</h3>
            <p className="text-sm text-gray-600 mb-4">
              Assign complaint <strong>{selectedComplaint.complaintId}</strong> to a field worker
            </p>
            <select
              className="w-full px-4 py-2 border rounded-md mb-4"
              onChange={(e) => {
                if (e.target.value) {
                  handleAssignComplaint(selectedComplaint._id, e.target.value);
                }
              }}
            >
              <option value="">Select field worker</option>
              {fieldWorkers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name} ({worker.phone})</option>
              ))}
            </select>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedComplaint(null);
                }}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority) => {
  const colors = {
    P1: 'bg-red-100 text-red-800',
    P2: 'bg-orange-100 text-orange-800',
    P3: 'bg-yellow-100 text-yellow-800',
    P4: 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export default DepartmentOfficerDashboard;
