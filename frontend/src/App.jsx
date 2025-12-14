import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerification from './pages/auth/OTPVerification';

// Public Pages (No Auth Required)
import PublicComplaint from './pages/PublicComplaint';
import PublicTracker from './pages/PublicTracker';

// Land Registry Pages
import LandRegistry from './pages/land/LandRegistry';
import PropertyVerification from './pages/land/PropertyVerification';
import PropertyRegistration from './pages/land/PropertyRegistration';
import MyProperties from './pages/land/MyProperties';
import TransferInitiation from './pages/land/TransferInitiation';

// Role-based dashboards
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DepartmentOfficerDashboard from './pages/dashboards/DepartmentOfficerDashboard';
import FieldWorkerDashboard from './pages/dashboards/FieldWorkerDashboard';
import CallCenterDashboard from './pages/dashboards/CallCenterDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      
      {/* Public Complaint Routes (No Authentication Required) */}
      <Route path="/complaint" element={<PublicComplaint />} />
      <Route path="/track" element={<PublicTracker />} />
      <Route path="/track/:complaintId" element={<PublicTracker />} />

      {/* Land Registry Routes */}
      <Route path="/land" element={<LandRegistry />} />
      <Route path="/land/verify" element={<PropertyVerification />} />
      <Route path="/land/register" element={<PropertyRegistration />} />
      <Route path="/land/my-properties" element={<MyProperties />} />
      <Route path="/land/transfer/new" element={<TransferInitiation />} />

      {/* Protected Routes - Role Based Dashboards */}
      <Route
        path="/dashboard/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['city_admin', 'system_admin', 'super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/department"
        element={
          <ProtectedRoute allowedRoles={['department_officer', 'department_head']}>
            <DepartmentOfficerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/field-worker"
        element={
          <ProtectedRoute allowedRoles={['field_worker']}>
            <FieldWorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/call-center"
        element={
          <ProtectedRoute allowedRoles={['call_center_agent']}>
            <CallCenterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Auto-redirect to appropriate dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Access Denied</h1></div>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Component to redirect users to their role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  const roleDashboards = {
    citizen: '/dashboard/citizen',
    call_center_agent: '/dashboard/call-center',
    field_worker: '/dashboard/field-worker',
    department_officer: '/dashboard/department',
    department_head: '/dashboard/department',
    ward_admin: '/dashboard/admin',
    city_admin: '/dashboard/admin',
    system_admin: '/dashboard/admin',
    super_admin: '/dashboard/admin'
  };

  const dashboardPath = roleDashboards[user.role] || '/dashboard/citizen';
  return <Navigate to={dashboardPath} />;
};

export default App;
