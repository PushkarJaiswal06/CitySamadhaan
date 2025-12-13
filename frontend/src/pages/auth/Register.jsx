import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { roleService } from '../../services/roleService';
import { departmentService } from '../../services/departmentService';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    departmentId: '',
    authMethod: 'password',
    language: 'en'
  });

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showOTPField, setShowOTPField] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to load roles');
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'roleId') {
      const role = roles.find(r => r._id === value);
      setSelectedRole(role);
      
      // Reset department if role doesn't require it
      if (!requiresDepartment(role)) {
        setFormData(prev => ({ ...prev, departmentId: '' }));
      }
    }
  };

  const requiresDepartment = (role) => {
    if (!role) return false;
    return ['department_officer', 'department_head', 'field_worker'].includes(role.name);
  };

  const requiresEmail = (role) => {
    if (!role) return false;
    return !['citizen', 'call_center_agent'].includes(role.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.phone || !formData.roleId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (selectedRole && requiresEmail(selectedRole) && !formData.email) {
      toast.error('Email is required for this role');
      return;
    }

    if (selectedRole && requiresDepartment(selectedRole) && !formData.departmentId) {
      toast.error('Department is required for this role');
      return;
    }

    if (formData.authMethod === 'password') {
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.authMethod === 'password' ? formData.password : undefined,
        role: formData.roleId,
        department: formData.departmentId || undefined,
        authMethod: formData.authMethod,
        language: formData.language
      };

      const result = await register(userData);

      if (result.data.requiresOTP) {
        toast.success('OTP sent to your phone!');
        navigate('/verify-otp', { state: { phone: formData.phone } });
      } else {
        toast.success('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-primary-600">CitySamdhaan</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                pattern="[6-9][0-9]{9}"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Role *
              </label>
              <select
                name="roleId"
                required
                value={formData.roleId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Select Role --</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.displayName}
                  </option>
                ))}
              </select>
              {selectedRole && (
                <p className="mt-1 text-xs text-gray-500">{selectedRole.description}</p>
              )}
            </div>

            {/* Department (conditional) */}
            {selectedRole && requiresDepartment(selectedRole) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <select
                  name="departmentId"
                  required
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email (conditional) */}
            {selectedRole && requiresEmail(selectedRole) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {/* Auth Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Authentication Method
              </label>
              <select
                name="authMethod"
                value={formData.authMethod}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="password">Password</option>
                <option value="otp">OTP (One-Time Password)</option>
              </select>
            </div>

            {/* Password (if password auth) */}
            {formData.authMethod === 'password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="8"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
