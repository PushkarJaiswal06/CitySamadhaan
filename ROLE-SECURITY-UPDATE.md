# Role-Based Registration Security Update

## Overview
Implemented security restrictions on user registration to prevent unauthorized role assignment and privilege escalation.

## Changes Made

### 1. Frontend - Register Component (`frontend/src/pages/auth/Register.jsx`)

**What Changed:**
- Removed role selection dropdown (previously allowed selecting any role including admin)
- Removed department selection (not needed for citizens)
- Simplified form to citizen-only registration
- Added informational notice explaining role restrictions

**Key Improvements:**
- ✅ Users can now only register as citizens
- ✅ Phone, name, email (optional), password, and language selection remain
- ✅ Clear messaging: "This registration is for citizens only"
- ✅ Other roles must be onboarded by administrators

**Security Impact:**
- Prevents unauthorized users from self-registering as:
  - Super Admin
  - Admin
  - Department Head
  - Department Officer
  - Field Worker
  - Call Center Agent
  - Analyst

### 2. Backend - Already Secured (`backend/controllers/authController.js`)

**Existing Protection:**
```javascript
// Line 21-28: Always assigns citizen role
const citizenRole = await Role.findOne({ name: 'citizen' });
if (!citizenRole) {
  return res.status(500).json({ message: 'System error: Citizen role not found' });
}

// Ignores any roleId from request body
userData.role = citizenRole._id;
```

**Backend was already secure** - the frontend just exposed the unnecessary UI elements.

### 3. Admin User Management (`frontend/src/components/UserManagement.jsx`)

**New Component Created:**
- Allows super admin to create staff accounts with any role
- Features:
  - ✅ Create users with roles (excluding citizen)
  - ✅ Assign departments for role-based users
  - ✅ View all system users in a table
  - ✅ Delete users (except super admin)
  - ✅ Filter roles to exclude "citizen" (they register themselves)

**Form Fields:**
- Name (required)
- Phone (required)
- Email (optional)
- Role (required) - Shows all non-citizen roles
- Department (conditional) - Required for department-related roles
- Password (required)

### 4. Admin Dashboard Integration (`frontend/src/pages/dashboards/AdminDashboard.jsx`)

**Added:**
- New "Manage Users" tab with UserManagement component
- Tab icon: FaUserPlus (user with plus icon)
- Accessible alongside Overview, Complaints, and Users tabs

## API Endpoints Used

### Existing Backend Routes (Already Available)
```javascript
// User Management
GET    /api/users              // List all users (with filters)
POST   /api/users              // Create new user (admin only)
GET    /api/users/:id          // Get single user
PATCH  /api/users/:id          // Update user
DELETE /api/users/:id          // Delete user

// Authentication
POST   /api/auth/register      // Public citizen registration (secured)
POST   /api/auth/login         // Login
```

### Permissions Required
All user management endpoints require:
- Authentication (JWT token)
- Permission: `users:create`, `users:read`, `users:delete`

## Security Measures

### 1. Frontend Protection
- ❌ **Removed**: Role selection from public registration
- ✅ **Added**: Clear messaging about citizen-only registration
- ✅ **Added**: Admin-only user management interface

### 2. Backend Protection (Already in place)
- ✅ Always assigns citizen role regardless of request body
- ✅ Permission-based access to user management endpoints
- ✅ JWT authentication required for administrative actions

### 3. Role Assignment Logic
```
Public Registration (/register)
├─ Can only create: Citizen accounts
├─ No role selection allowed
└─ Automatic citizen role assignment

Admin User Management (/dashboard → Manage Users)
├─ Can create: All roles except citizen
├─ Requires: Super Admin or Admin permissions
├─ Validates: Role and department relationships
└─ Enforces: Password requirements
```

## User Flow

### Citizen Registration Flow
1. User visits `/register`
2. Fills: Name, Phone, Email (opt), Password, Language
3. Submits → Backend assigns "citizen" role automatically
4. Success → Redirected to login
5. Can access: Citizen Dashboard (file/track complaints)

### Staff Onboarding Flow (Admin)
1. Admin logs in → Goes to Dashboard
2. Clicks "Manage Users" tab
3. Clicks "+ Add Staff User" button
4. Fills form with role selection
5. For dept-related roles → Selects department
6. Submits → New staff account created
7. Staff member receives credentials
8. Staff logs in → Assigned to role-specific dashboard

## Testing Checklist

- [ ] Public registration creates only citizen accounts
- [ ] Role selection is NOT visible on `/register` page
- [ ] Admin can access "Manage Users" tab
- [ ] Admin can create users with non-citizen roles
- [ ] Department selection appears for dept-related roles
- [ ] Users list displays correctly in management interface
- [ ] Delete user works (except for super admin)
- [ ] Created staff users can login successfully
- [ ] Staff users see their role-specific dashboard

## Database Roles Available

### For Public Registration
- ✅ Citizen (auto-assigned)

### For Admin Onboarding
- ✅ Super Admin
- ✅ Admin
- ✅ Department Head
- ✅ Department Officer
- ✅ Field Worker
- ✅ Call Center Agent
- ✅ Analyst

## Next Steps

1. **Test the changes:**
   ```bash
   # Start backend
   cd backend
   npm start
   
   # Start frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Verify citizen registration:**
   - Go to http://localhost:5173/register
   - Register a new account
   - Confirm no role selection is shown
   - Check database: user should have citizen role

3. **Test admin user management:**
   - Login as admin: Phone `9876543210`, Password `Admin@123456`
   - Go to Dashboard → Manage Users tab
   - Create a new department officer or field worker
   - Verify they can login

## Security Benefits

✅ **Prevents privilege escalation:** Users can't self-assign admin roles  
✅ **Centralized control:** Only authorized admins can create privileged accounts  
✅ **Audit trail:** All staff accounts created through admin interface  
✅ **Role separation:** Citizens self-register, staff are onboarded  
✅ **Defense in depth:** Both frontend and backend enforce restrictions

## Files Modified

1. ✏️ `frontend/src/pages/auth/Register.jsx` - Simplified to citizen-only
2. ✏️ `frontend/src/pages/dashboards/AdminDashboard.jsx` - Added manage users tab
3. ➕ `frontend/src/components/UserManagement.jsx` - New staff onboarding interface

## Files Already Secure (No Changes Needed)

- ✅ `backend/controllers/authController.js` - Already forces citizen role
- ✅ `backend/controllers/userController.js` - Has createUser method
- ✅ `backend/routes/userRoutes.js` - Routes already configured
- ✅ `backend/middleware/auth.js` - Permission checks in place

---

**Status:** ✅ Complete  
**Security Level:** High  
**Testing Required:** Yes  
**Breaking Changes:** None (existing users unaffected)
