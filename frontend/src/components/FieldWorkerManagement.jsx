import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { roleService } from '../services/roleService';
import api from '../services/api';
import toast from 'react-hot-toast';

const FieldWorkerManagement = ({ canAddWorkers = true }) => {
  const { user } = useAuthStore();
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    language: 'en'
  });

  useEffect(() => {
    fetchFieldWorkers();
  }, []);

  const fetchFieldWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users', {
        params: {
          department: user?.department?._id,
          role: await getFieldWorkerRoleId()
        }
      });
      setFieldWorkers(data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch field workers:', error);
      setFieldWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFieldWorkerRoleId = async () => {
    try {
      const { data } = await roleService.getRoles();
      const fieldWorkerRole = data.find(role => role.name === 'field_worker');
      return fieldWorkerRole?._id;
    } catch (error) {
      console.error('Failed to get field worker role:', error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const fieldWorkerRoleId = await getFieldWorkerRoleId();
      
      if (!fieldWorkerRoleId) {
        toast.error('Field worker role not found');
        return;
      }

      await api.post('/users', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        role: fieldWorkerRoleId,
        department: user?.department?._id,
        language: formData.language
      });

      toast.success('Field worker added successfully');
      setShowModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        language: 'en'
      });
      fetchFieldWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add field worker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!confirm('Are you sure you want to remove this field worker?')) return;

    try {
      await api.delete(`/users/${workerId}`);
      toast.success('Field worker removed successfully');
      fetchFieldWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove field worker');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Field Worker Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage field workers for {user?.department?.name}
          </p>
        </div>
        {canAddWorkers && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            + Add Field Worker
          </button>
        )}
      </div>

      {/* Field Workers List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : fieldWorkers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No field workers found. Add your first field worker to get started.
                </td>
              </tr>
            ) : (
              fieldWorkers.map(worker => (
                <tr key={worker._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{worker.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      worker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteWorker(worker._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Field Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Field Worker</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldWorkerManagement;
