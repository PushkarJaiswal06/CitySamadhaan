# Quick Reference - Login Credentials

## 🔑 Admin Login

```
URL: http://localhost:5173/login
Phone: 9876543210
Password: Admin@123456
Role: Super Administrator
```

## 👥 All Role Levels

| Level | Role | Login Required | Key Permissions |
|-------|------|----------------|-----------------|
| - | **Public User** | ❌ No | File complaints, Track by ID, View all complaints |
| 2 | Call Center Agent | ✅ Yes | Create/Update complaints, Read users |
| 3 | Field Worker | ✅ Yes | Update assigned complaints, Verify land |
| 4 | Department Officer | ✅ Yes | Assign complaints, View reports |
| 5 | Department Head | ✅ Yes | Bulk actions, Approve land, Delete complaints |
| 6 | Ward Administrator | ✅ Yes | Ward management, Create/Update/Delete users |
| 7 | City Administrator | ✅ Yes | City-wide management, Role assignment |
| 8 | System Administrator | ✅ Yes | Technical operations, Blockchain access |
| 9 | Super Administrator | ✅ Yes | **FULL ACCESS TO EVERYTHING** |

## 🌐 Public Access (No Login)

### File Complaint:
- URL: `http://localhost:5173/complaint`
- Requirements: Name, Phone, Description
- Gets: Unique complaint ID (e.g., CSB-2024-00001)

### Track Complaint:
- URL: `http://localhost:5173/track/CSB-2024-00001`
- Requirements: Just complaint ID
- Shows: Status, Timeline, Blockchain proof

### Browse Complaints:
- URL: `http://localhost:5173/complaints/public`
- Shows: All complaints (personal data anonymized)
- Filter: By status, department, priority

## 🔗 Blockchain Contracts

```
Network: Ethereum Sepolia Testnet
Explorer: https://sepolia.etherscan.io/

ComplaintRegistry: 0x425A70503a1Aacb0c9aDa9B9f2ED199Ffc116ef5
AuditTrail: 0x1ba012De634A47D0a2Cd2dd5A889c449A35aA18B
Deployer Wallet: 0xD5b76994c04105ba70b7a4eF1FFa2866b911a4E8
```

## 📝 Creating Test Users

Login as admin, then:
1. Go to Admin Panel → Users → Add User
2. Fill details
3. Select role from dropdown
4. Set password
5. User can login immediately

## 🚀 Quick Start

```bash
# 1. Seed database
cd backend
node scripts/seedDatabase.js

# 2. Start backend
npm run dev

# 3. Start frontend
cd ../frontend
npm run dev

# 4. Public access: http://localhost:5173/complaint
# 5. Admin login: http://localhost:5173/login
```

## 📞 Support

- Email: admin@citysamadhaan.in
- Phone: 9876543210
- GitHub: [Repository]

---

**Remember:** 
- ✅ Public users can file & track without login
- ✅ Admin credentials: 9876543210 / Admin@123456
- ✅ All complaints are blockchain verified
- ✅ Personal data is anonymized in public view
