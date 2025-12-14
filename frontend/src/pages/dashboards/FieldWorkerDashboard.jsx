import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import toast from 'react-hot-toast';
import {
  FaSignOutAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaCamera,
  FaMapMarkerAlt,
  FaEye
} from 'react-icons/fa';

const FieldWorkerDashboard = () => {
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    comment: ''
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Backend automatically filters by assignedTo for field workers
      const { data } = await complaintService.getComplaints();
      console.log('Field worker complaints:', data);
      setTasks(data.complaints || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await complaintService.uploadImage(formData);
      setUploadedImages([...uploadedImages, data.imageUrl]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTask || !updateData.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      await complaintService.updateStatus(selectedTask._id, updateData);
      toast.success('Task updated successfully');
      setShowDetailModal(false);
      setSelectedTask(null);
      setUpdateData({ status: '', comment: '' });
      setUploadedImages([]);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleStartWork = async (taskId) => {
    try {
      await complaintService.updateStatus(taskId, {
        status: 'in_progress',
        comment: 'Field worker started working on this complaint'
      });
      toast.success('Task started');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to start task');
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
          <p className="mt-4 text-gray-600">Loading tasks...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Field Worker Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={tasks.length}
            icon={<FaTasks className="text-3xl text-blue-600" />}
          />
          <StatCard
            title="In Progress"
            value={tasks.filter(t => t.status === 'in_progress').length}
            icon={<FaClock className="text-3xl text-yellow-600" />}
          />
          <StatCard
            title="Completed Today"
            value={tasks.filter(t => {
              const today = new Date().toDateString();
              return t.status === 'resolved' && new Date(t.updatedAt).toDateString() === today;
            }).length}
            icon={<FaCheckCircle className="text-3xl text-green-600" />}
          />
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex items-center space-x-2">
            <FaTasks className="text-primary-600" />
            <h2 className="text-lg font-semibold">My Assigned Tasks</h2>
          </div>
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <FaCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{task.complaintId}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium mb-2">{task.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        
                        {task.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <FaMapMarkerAlt className="mr-1 text-red-500" />
                            <span>{task.location.address}</span>
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Created: {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {task.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(task._id)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Start Work
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setUpdateData({ status: 'resolved', comment: '' });
                            setShowDetailModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Update Task Status</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">{selectedTask.complaintId}</h4>
              <p className="text-sm text-gray-600">{selectedTask.title}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="">Select Status</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment/Update
                </label>
                <textarea
                  value={updateData.comment}
                  onChange={(e) => setUpdateData({ ...updateData, comment: e.target.value })}
                  placeholder="Enter your update or resolution note..."
                  className="w-full px-4 py-2 border rounded-md"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaCamera className="mr-2" />
                  Upload Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {uploadedImages.length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    {uploadedImages.length} image(s) uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Update Task
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTask(null);
                  setUpdateData({ status: '', comment: '' });
                  setUploadedImages([]);
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
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800'
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

export default FieldWorkerDashboard;
