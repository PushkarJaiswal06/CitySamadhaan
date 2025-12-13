import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'citizen', label: 'Citizen', requiresEmail: false },
  { value: 'call_center_agent', label: 'Call Center Agent', requiresEmail: true },
  { value: 'field_worker', label: 'Field Worker', requiresEmail: true },
  { value: 'department_officer', label: 'Department Officer', requiresEmail: true },
  { value: 'department_head', label: 'Department Head', requiresEmail: true },
  { value: 'ward_admin', label: 'Ward Administrator', requiresEmail: true },
  { value: 'city_admin', label: 'City Administrator', requiresEmail: true },
  { value: 'system_admin', label: 'System Administrator', requiresEmail: true },
  { value: 'super_admin', label: 'Super Administrator', requiresEmail: true }
];

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    role: 'citizen',
    authMethod: 'otp'
  });

  const selectedRole = ROLES.find(r => r.value === formData.role);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If role changes, adjust auth method requirement
    if (name === 'role') {
      const role = ROLES.find(r => r.value === value);
      if (role?.requiresEmail) {
        setFormData(prev => ({ ...prev, role: value, authMethod: 'password' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const credentials = {
        phone: formData.phone,
        authMethod: formData.authMethod
      };

      // Add password for password auth
      if (formData.authMethod === 'password') {
        credentials.password = formData.password;
        if (selectedRole?.requiresEmail && formData.email) {
          credentials.email = formData.email;
        }
      }

      const result = await login(credentials);

      if (formData.authMethod === 'otp' && result.data?.requiresOTP) {
        toast.success('OTP sent to your phone!');
        navigate('/verify-otp', { state: { phone: formData.phone } });
      } else {
        toast.success('Login successful!');
        // Redirect to dashboard (will auto-redirect based on role)
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-indigo-600">CitySamdhaan</h1>
            <p className="text-sm text-gray-600">Digital Governance Platform</p>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select your role to access appropriate dashboard
              </p>
            </div>

            {/* Phone Number */}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email (for non-citizen roles) */}
            {selectedRole?.requiresEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {/* Auth Method Selection */}
            {!selectedRole?.requiresEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Login Method
                </label>
                <select
                  name="authMethod"
                  value={formData.authMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="otp">OTP (One-Time Password)</option>
                  <option value="password">Password</option>
                </select>
              </div>
            )}

            {/* Password (conditional) */}
            {(formData.authMethod === 'password' || selectedRole?.requiresEmail) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  formData.authMethod === 'password' || selectedRole?.requiresEmail ? 'Sign In' : 'Send OTP'
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-xs text-blue-800">
                <strong>Citizens:</strong> Can use OTP or Password<br />
                <strong>Officials:</strong> Must use Email + Password
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
