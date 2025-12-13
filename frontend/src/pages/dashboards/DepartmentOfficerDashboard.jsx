import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FaSignOutAlt } from 'react-icons/fa';

const DepartmentOfficerDashboard = () => {
  const { user, logout } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await complaintService.getComplaints();
      setComplaints(data.complaints);
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
            <h1 className="text-2xl font-bold text-gray-900">Department Officer Dashboard</h1>
            <p className="text-sm text-gray-600">{user?.department?.name} - {user?.name}</p>
          </div>
          <button onClick={() => logout()} className="flex items-center space-x-2 text-gray-700 hover:text-red-600">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Department Complaints</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-center text-gray-500">No complaints found</p>
            ) : (
              <div className="space-y-4">
                {complaints.map(complaint => (
                  <div key={complaint._id} className="border p-4 rounded hover:shadow-md">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{complaint.complaintId}</h3>
                        <p className="text-sm text-gray-600">{complaint.title}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                        {complaint.status}
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

export default DepartmentOfficerDashboard;
