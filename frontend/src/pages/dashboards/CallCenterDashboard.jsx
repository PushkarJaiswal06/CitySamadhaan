import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FaSignOutAlt, FaPhoneAlt } from 'react-icons/fa';

const CallCenterDashboard = () => {
  const { user, logout } = useAuthStore();
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentComplaints();
  }, []);

  const fetchRecentComplaints = async () => {
    try {
      const { data } = await complaintService.getComplaints({ source: 'call_center', page: 1, limit: 20 });
      setRecentComplaints(data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Center Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button onClick={() => logout()} className="flex items-center space-x-2 text-gray-700 hover:text-red-600">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center space-x-3">
            <FaPhoneAlt className="text-3xl text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold">Register Complaint via Call</h2>
              <p className="text-sm text-gray-600">File complaints on behalf of citizens calling the helpline</p>
            </div>
          </div>
          <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
            New Complaint Registration
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Recently Registered</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : recentComplaints.length === 0 ? (
              <p className="text-center text-gray-500">No recent complaints</p>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map(complaint => (
                  <div key={complaint._id} className="border p-4 rounded">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{complaint.complaintId}</h3>
                        <p className="text-sm text-gray-600">{complaint.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Caller: {complaint.citizen?.name} ({complaint.citizen?.phone})</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Registered
                      </span>
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

export default CallCenterDashboard;
