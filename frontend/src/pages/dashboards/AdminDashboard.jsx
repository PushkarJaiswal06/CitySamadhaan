import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FaSignOutAlt, FaUsers, FaFileAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        complaintService.getStats(),
        complaintService.getComplaints({ page: 1, limit: 10 })
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data.complaints);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name} ({user?.role?.displayName})</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <AdminStatCard
            title="Total Complaints"
            value={stats?.total?.[0]?.count || 0}
            icon={<FaFileAlt className="text-3xl text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <AdminStatCard
            title="Pending"
            value={stats?.byStatus?.find(s => s._id === 'pending')?.count || 0}
            icon={<FaClock className="text-3xl text-yellow-600" />}
            bgColor="bg-yellow-50"
          />
          <AdminStatCard
            title="In Progress"
            value={stats?.byStatus?.find(s => s._id === 'in_progress')?.count || 0}
            icon={<FaClock className="text-3xl text-purple-600" />}
            bgColor="bg-purple-50"
          />
          <AdminStatCard
            title="Resolved"
            value={stats?.byStatus?.find(s => s._id === 'resolved')?.count || 0}
            icon={<FaCheckCircle className="text-3xl text-green-600" />}
            bgColor="bg-green-50"
          />
        </div>

        {/* Department Stats */}
        {stats?.byDepartment && stats.byDepartment.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Complaints by Department</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.byDepartment.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-2xl font-bold text-primary-600">{dept.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.complaintId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.department?.name}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, value, icon, bgColor }) => (
  <div className={`${bgColor} rounded-lg shadow p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
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
  return colors[status] || colors.pending;
};

const getPriorityColor = (priority) => {
  const colors = {
    P1: 'bg-red-100 text-red-800',
    P2: 'bg-orange-100 text-orange-800',
    P3: 'bg-yellow-100 text-yellow-800',
    P4: 'bg-green-100 text-green-800'
  };
  return colors[priority] || colors.P3;
};

export default AdminDashboard;
