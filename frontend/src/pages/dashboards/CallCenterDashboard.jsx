import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';
import {
  FaSignOutAlt,
  FaPhoneAlt,
  FaUserPlus,
  FaFileAlt,
  FaSearch,
  FaCheckCircle
} from 'react-icons/fa';

const CallCenterDashboard = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('file'); // file, recent
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Citizen search
  const [searchPhone, setSearchPhone] = useState('');
  const [citizenData, setCitizenData] = useState(null);
  
  // Complaint form
  const [complaintData, setComplaintData] = useState({
    citizenName: '',
    citizenPhone: '',
    title: '',
    description: '',
    category: '',
    department: '',
    location: {
      address: '',
      area: '',
      wardNumber: '',
      city: '',
      pincode: ''
    },
    priority: 'P3'
  });

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
    if (activeTab === 'recent') {
      fetchRecentComplaints();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchRecentComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await complaintService.getComplaints({
        source: 'call_center',
        page: 1,
        limit: 50
      });
      setRecentComplaints(data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCitizen = async () => {
    // In production, this would search for existing citizen by phone
    // For now, allow manual entry
    if (searchPhone.length === 10) {
      setComplaintData({
        ...complaintData,
        citizenPhone: searchPhone
      });
      toast.success('Proceed to file complaint for this number');
    } else {
      toast.error('Please enter a valid 10-digit phone number');
    }
  };

  const handleFileComplaint = async (e) => {
    e.preventDefault();

    if (!complaintData.citizenPhone || !complaintData.title || !complaintData.department) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await complaintService.createComplaint({
        ...complaintData,
        source: 'call_center',
        language: 'hi' // Default to Hindi for call center
      });
      
      toast.success('Complaint registered successfully!');
      
      // Reset form
      setComplaintData({
        citizenName: '',
        citizenPhone: '',
        title: '',
        description: '',
        category: '',
        department: '',
        location: {
          address: '',
          area: '',
          wardNumber: '',
          city: '',
          pincode: ''
        },
        priority: 'P3'
      });
      setSearchPhone('');
      setCitizenData(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register complaint');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Call Center Dashboard</h1>
              <p className="text-sm text-gray-600">Agent: {user?.name} • Register complaints via phone</p>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('file')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'file'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaPhoneAlt className="inline mr-2" />
              File Complaint
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'recent'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Recent Complaints
            </button>
          </div>
        </div>

        {/* File Complaint Tab */}
        {activeTab === 'file' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Register New Complaint</h2>

            {/* Citizen Search */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Citizen by Phone Number
              </label>
              <div className="flex space-x-3">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  className="flex-1 px-4 py-2 border rounded-md"
                />
                <button
                  onClick={handleSearchCitizen}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                >
                  <FaSearch />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleFileComplaint} className="space-y-6">
              {/* Citizen Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={complaintData.citizenName}
                    onChange={(e) => setComplaintData({ ...complaintData, citizenName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="Enter citizen's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={complaintData.citizenPhone}
                    onChange={(e) => setComplaintData({ ...complaintData, citizenPhone: e.target.value })}
                    maxLength="10"
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>

              {/* Complaint Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  value={complaintData.title}
                  onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Brief title of the complaint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Detailed description of the issue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    required
                    value={complaintData.department}
                    onChange={(e) => setComplaintData({ ...complaintData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={complaintData.category}
                    onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={complaintData.priority}
                    onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="P4">P4 - Low</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P2">P2 - High</option>
                    <option value="P1">P1 - Critical</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={complaintData.location.address}
                  onChange={(e) => setComplaintData({
                    ...complaintData,
                    location: { ...complaintData.location, address: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Full address of the issue location"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Locality
                  </label>
                  <input
                    type="text"
                    value={complaintData.location.area}
                    onChange={(e) => setComplaintData({
                      ...complaintData,
                      location: { ...complaintData.location, area: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward Number
                  </label>
                  <input
                    type="text"
                    value={complaintData.location.wardNumber}
                    onChange={(e) => setComplaintData({
                      ...complaintData,
                      location: { ...complaintData.location, wardNumber: e.target.value }
                    })}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={complaintData.location.pincode}
                    onChange={(e) => setComplaintData({
                      ...complaintData,
                      location: { ...complaintData.location, pincode: e.target.value }
                    })}
                    maxLength="6"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>{loading ? 'Submitting...' : 'Register Complaint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComplaintData({
                      citizenName: '',
                      citizenPhone: '',
                      title: '',
                      description: '',
                      category: '',
                      department: '',
                      location: {
                        address: '',
                        area: '',
                        wardNumber: '',
                        city: '',
                        pincode: ''
                      },
                      priority: 'P3'
                    });
                    setSearchPhone('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Complaints Tab */}
        {activeTab === 'recent' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Recently Registered Complaints</h2>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No complaints registered yet
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citizen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {complaint.complaintId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {complaint.citizen?.name}
                          <br />
                          <span className="text-xs">{complaint.citizen?.phone}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{complaint.department?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(complaint.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallCenterDashboard;
