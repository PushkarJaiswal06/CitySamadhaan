import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { FaPlus, FaList, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user, logout } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await complaintService.getComplaints({ page: 1, limit: 10 });
      setComplaints(data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await complaintService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
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
          <StatCard
            title="Total Complaints"
            value={stats?.total?.[0]?.count || 0}
            icon={<FaList className="text-3xl text-primary-600" />}
          />
          <StatCard
            title="Pending"
            value={stats?.byStatus?.find(s => s._id === 'pending')?.count || 0}
            icon={<FaChartBar className="text-3xl text-yellow-600" />}
          />
          <StatCard
            title="In Progress"
            value={stats?.byStatus?.find(s => s._id === 'in_progress')?.count || 0}
            icon={<FaChartBar className="text-3xl text-blue-600" />}
          />
          <StatCard
            title="Resolved"
            value={stats?.byStatus?.find(s => s._id === 'resolved')?.count || 0}
            icon={<FaChartBar className="text-3xl text-green-600" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <ActionButton
              icon={<FaPlus />}
              title="File New Complaint"
              description="Register a new civic complaint"
              onClick={() => toast.info('Complaint form coming soon')}
            />
            <ActionButton
              icon={<FaList />}
              title="My Complaints"
              description="View all your complaints"
              onClick={() => {}}
            />
            <ActionButton
              icon={<FaChartBar />}
              title="Track Status"
              description="Track complaint progress"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-center text-gray-500">No complaints yet. File your first complaint!</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{complaint.complaintId}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          {complaint.sla?.breached && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              SLA Breached
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-medium text-gray-900">{complaint.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{complaint.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>📍 {complaint.location?.address}</span>
                          <span>🏢 {complaint.department?.name}</span>
                          <span>⏰ {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const ActionButton = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left"
  >
    <div className="text-2xl text-primary-600">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
);

export default CitizenDashboard;
