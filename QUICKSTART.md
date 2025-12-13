# 🚀 CitySamdhaan - Quick Start Guide

## Step-by-Step Launch

### 1️⃣ Start Backend (Terminal 1)

```powershell
cd C:\Users\"Pushkar Jaiswal"\Desktop\CitySamdhaan\backend

# First time only - seed database
npm run seed

# Start development server
npm run dev
```

**✅ Success when you see:**
```
✅ MongoDB Connected: localhost
✅ Redis Connected
🚀 Server running on port 5000
```

---

### 2️⃣ Start Frontend (Terminal 2)

```powershell
cd C:\Users\"Pushkar Jaiswal"\Desktop\CitySamdhaan\frontend

# Start Vite dev server
npm run dev
```

**✅ Success when you see:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### 3️⃣ Open Browser

Navigate to: **http://localhost:5173**

---

## 🔑 Test Login Credentials

### Admin Account
```
Phone: 9876543210
Password: Admin@123456
Role: Super Administrator
```

### Create New Citizen
1. Click "Register"
2. Fill form with your details
3. Choose "OTP" or "Password" method
4. Submit and login

---

## 📋 Available Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/login` | Role-based login |
| `/register` | Citizen registration |
| `/verify-otp` | OTP verification |
| `/dashboard/citizen` | Citizen dashboard |
| `/dashboard/admin` | Admin dashboard |
| `/dashboard/department_officer` | Officer dashboard |
| `/dashboard/field_worker` | Field worker dashboard |
| `/dashboard/call_center_agent` | Call center dashboard |

---

## 🛠️ Troubleshooting

### Backend won't start?
**Problem:** MongoDB or Redis not running  
**Solution:**
```powershell
# Option 1: Use Cloud Databases (Recommended - No Installation!)
# See UPSTASH-SETUP.md for detailed guide

# Option 2: Install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Option 3: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

---

### Frontend shows blank page?
**Problem:** Backend not running  
**Solution:** Start backend first (Step 1 above)

---

### "Network Error" in browser?
**Problem:** CORS issue  
**Solution:** Check `backend/.env` has:
```env
VITE_API_URL=http://localhost:5000
```

---

### OTP not receiving?
**Problem:** MSG91 not configured  
**Solution:** Use **Password** method instead of OTP for testing

---

## 🧪 Quick API Test

```powershell
# Test if backend is working
curl http://localhost:5000/health

# Expected response:
{
  "status": "OK",
  "message": "CitySamdhaan API is running"
}
```

---

## 📁 Important Files to Know

### Backend
- `backend/.env` - API keys and secrets
- `backend/server.js` - Main entry point
- `backend/models/` - Database schemas

### Frontend
- `frontend/.env` - API URL configuration
- `frontend/src/App.jsx` - React routing
- `frontend/src/pages/` - All pages

---

## 🔄 Reset Everything

```powershell
# Backend
cd backend
npm run seed  # Re-creates database with fresh data

# Frontend
cd frontend
# Clear browser localStorage
# Refresh page (Ctrl+R)
```

---

## 📞 Quick Commands Reference

```powershell
# Backend
npm run dev     # Start server
npm run seed    # Seed database
npm test        # Run tests

# Frontend
npm run dev     # Start Vite
npm run build   # Production build
npm run preview # Preview build

# Database (if using Docker)
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs -f  # View logs
```

---

## ✨ What Works Right Now

✅ User registration  
✅ Login with password  
✅ Login with OTP (if MSG91 configured)  
✅ Role-based dashboards  
✅ Protected routes  
✅ Auto token refresh  
✅ Logout  

## 🚧 Coming Next

⏳ Complaint creation & management  
⏳ File uploads  
⏳ SMS/IVR integration  
⏳ Land registry  
⏳ Blockchain anchoring  

---

**Need help?** Check [INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md) for detailed documentation!

**Happy Coding! 🎉**
