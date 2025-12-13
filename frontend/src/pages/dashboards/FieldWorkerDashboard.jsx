import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FaSignOutAlt, FaTasks } from 'react-icons/fa';

const FieldWorkerDashboard = () => {
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await complaintService.getComplaints({ assignedTo: user?._id });
      setTasks(data.complaints);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Worker Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button onClick={() => logout()} className="flex items-center space-x-2 text-gray-700 hover:text-red-600">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex items-center space-x-2">
            <FaTasks className="text-primary-600" />
            <h2 className="text-lg font-semibold">My Assigned Tasks</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-gray-500">No tasks assigned yet</p>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task._id} className="border p-4 rounded hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.complaintId}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-2">📍 {task.location?.address}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {task.status}
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

export default FieldWorkerDashboard;
