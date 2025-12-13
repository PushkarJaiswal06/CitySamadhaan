# CitySamdhaan - Development Roadmap

## Project Timeline

**Total Duration**: 8 weeks  
**Team Size**: 3-4 developers (1 backend, 1 frontend, 1 blockchain, 1 mobile)  
**Tech Stack**: MERN (MongoDB, Express, React, Node.js) + Blockchain (Solidity, Hardhat, Ethers.js)

---

## Phase Overview

```
Phase 1: Foundation & Core Backend (Week 1-2)
    ↓
Phase 2: Frontend & SMS/IVR Integration (Week 3-4)
    ↓
Phase 3: Blockchain & Land Registry (Week 5-6)
    ↓
Phase 4: Mobile App & Production Deployment (Week 7-8)
```

---

## Phase 1: Foundation & Core Backend (Week 1-2)

### Week 1: Project Setup & Authentication

#### Day 1-2: Project Initialization

**Tasks**:
- [ ] Initialize Git repository
- [ ] Create folder structure (backend, frontend, blockchain)
- [ ] Set up package.json for all modules
- [ ] Configure ESLint + Prettier
- [ ] Set up .env files with example templates
- [ ] Create Docker Compose for MongoDB + Redis
- [ ] Set up Cloudinary account and get API keys
- [ ] Initialize Hardhat project for blockchain

**Deliverables**:
```
CitySamdhaan/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── nodemon.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── blockchain/
│   ├── contracts/
│   ├── package.json
│   └── hardhat.config.js
└── docker-compose.yml
```

**Commands**:
```bash
# Backend setup
cd backend
npm init -y
npm install express mongoose bcrypt jsonwebtoken express-validator cors helmet morgan winston dotenv

# Frontend setup
cd ../frontend
npm create vite@latest . -- --template react
npm install axios react-router-dom @tanstack/react-query zustand react-hook-form tailwindcss

# Blockchain setup
cd ../blockchain
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts ethers
npx hardhat init
```

---

#### Day 3-4: MongoDB Models & Authentication

**Tasks**:
- [ ] Create Mongoose models (User, Role, Department, ComplaintCategory)
- [ ] Implement JWT authentication (login, register, refresh token)
- [ ] Create OTP service using Twilio
- [ ] Implement RBAC middleware
- [ ] Set up Redis for session/OTP storage
- [ ] Create auth routes (register, login, verify-otp, logout)
- [ ] Write unit tests for auth module

**Models to Create**:
```javascript
// backend/src/models/
├── User.js
├── Role.js
├── Department.js
├── ComplaintCategory.js
└── index.js
```

**API Endpoints**:
```
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

**Test**:
```bash
# Test registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "name": "Test User", "password": "Test@123"}'
```

---

#### Day 5-7: Complaint System Backend

**Tasks**:
- [ ] Create Complaint, ComplaintUpdate models
- [ ] Implement complaint CRUD operations
- [ ] Create complaint service with status workflow
- [ ] Implement file upload middleware (Multer + Cloudinary)
- [ ] Create department routes and controllers
- [ ] Implement SLA calculation logic
- [ ] Set up Bull job queue for SLA monitoring
- [ ] Write complaint API tests

**Models**:
```javascript
// backend/src/models/
├── Complaint.js
├── ComplaintUpdate.js
└── AuditLog.js
```

**API Endpoints**:
```
GET    /api/v1/complaints           (List with filters)
POST   /api/v1/complaints           (Create complaint)
GET    /api/v1/complaints/:id       (Get details)
PATCH  /api/v1/complaints/:id/status (Update status)
PATCH  /api/v1/complaints/:id/assign (Assign to officer)
POST   /api/v1/complaints/:id/attachments (Upload photo)
GET    /api/v1/complaints/:id/history (Status history)

GET    /api/v1/departments
POST   /api/v1/departments
GET    /api/v1/departments/:id/complaints
```

**Cloudinary Integration**:
```javascript
// backend/src/middleware/upload.middleware.js
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'citysamdhaan/complaints',
    allowed_formats: ['jpg', 'png', 'pdf'],
  },
});

const upload = multer({ storage: storage });
```

---

### Week 2: Database Seeding & Advanced Features

#### Day 1-2: Seed Data & Admin Panel

**Tasks**:
- [ ] Create seed script for roles, departments, categories
- [ ] Seed initial admin user
- [ ] Create user management routes (CRUD)
- [ ] Implement analytics service (complaint stats, department performance)
- [ ] Create analytics endpoints
- [ ] Set up Winston logger for application logs

**Seed Data**:
```javascript
// backend/src/seeders/index.js
const roles = [
  { name: 'Citizen', slug: 'citizen', level: 1 },
  { name: 'Field Worker', slug: 'field_worker', level: 2 },
  { name: 'Department Officer', slug: 'dept_officer', level: 5 },
  { name: 'System Admin', slug: 'system_admin', level: 9 }
];

const departments = [
  { name: 'Water Supply', code: 'WATER', slaHours: { urgent: 4, high: 24 } },
  { name: 'Sanitation', code: 'SAFAI', slaHours: { urgent: 4, normal: 72 } }
];

const categories = [
  { department: waterDeptId, name: 'Water Leakage', keywords: ['leak', 'leakage'] },
  { department: sanitationDeptId, name: 'Garbage Not Collected', keywords: ['garbage'] }
];
```

**Run Seed**:
```bash
node backend/src/seeders/index.js
```

---

#### Day 3-4: Real-Time Updates & Notifications

**Tasks**:
- [ ] Set up Socket.io server
- [ ] Implement real-time complaint updates
- [ ] Create notification service (SMS via Twilio)
- [ ] Implement email service (optional, using Nodemailer)
- [ ] Create Bull job for sending notifications
- [ ] Test real-time updates with Postman/socket client

**Socket.io Events**:
```javascript
// backend/src/sockets/index.js
io.on('connection', (socket) => {
  // Join room based on role
  socket.join(`user:${socket.userId}`);
  
  // Emit when complaint status changes
  socket.on('complaint:updated', (data) => {
    io.to(`user:${data.citizenId}`).emit('complaint:updated', data);
  });
});
```

**Notification Job**:
```javascript
// backend/src/jobs/smsNotification.job.js
const notificationQueue = new Queue('notifications', redisConfig);

notificationQueue.process(async (job) => {
  const { phone, message } = job.data;
  await twilioClient.messages.create({
    to: phone,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: message
  });
});
```

---

#### Day 5-7: Testing & Documentation

**Tasks**:
- [ ] Write integration tests (Jest + Supertest)
- [ ] Test all API endpoints
- [ ] Test RBAC middleware
- [ ] Test file upload flow
- [ ] Generate API documentation (Swagger/Postman)
- [ ] Create Postman collection
- [ ] Code review and refactoring

**Test Coverage Target**: 70%+

```bash
npm test -- --coverage
```

---

## Phase 2: Frontend & SMS/IVR Integration (Week 3-4)

### Week 3: React Frontend

#### Day 1-2: Frontend Setup & Authentication

**Tasks**:
- [ ] Set up React + Vite + Tailwind CSS
- [ ] Configure React Router v6
- [ ] Set up Axios interceptors
- [ ] Create authentication context
- [ ] Build login/register pages
- [ ] Build OTP verification page
- [ ] Implement protected routes
- [ ] Create reusable components (Button, Input, Card, Modal)

**Pages**:
```javascript
// frontend/src/pages/
├── auth/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── OTPVerification.jsx
```

**Axios Setup**:
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);
```

---

#### Day 3-5: Complaint Management UI

**Tasks**:
- [ ] Build complaint filing form (with photo upload)
- [ ] Build complaint list page (with filters)
- [ ] Build complaint detail page (with status timeline)
- [ ] Implement real-time status updates (Socket.io client)
- [ ] Create complaint tracking page (public)
- [ ] Build department selection UI
- [ ] Implement location picker (Google Maps/Leaflet)

**Pages**:
```javascript
// frontend/src/pages/citizen/
├── FileComplaint.jsx
├── MyComplaints.jsx
├── TrackComplaint.jsx
└── ComplaintDetail.jsx
```

**Real-Time Updates**:
```javascript
// frontend/src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') }
    });
    
    socket.on('complaint:updated', (data) => {
      // Update UI
      queryClient.invalidateQueries(['complaint', data.complaintId]);
    });
    
    return () => socket.disconnect();
  }, []);
}
```

---

#### Day 6-7: Admin Dashboard

**Tasks**:
- [ ] Build admin dashboard with statistics
- [ ] Create complaint management table
- [ ] Build user management page
- [ ] Create department performance charts (Recharts)
- [ ] Implement complaint assignment UI
- [ ] Build SLA monitoring view
- [ ] Add export to CSV functionality

**Dashboard Components**:
```javascript
// frontend/src/pages/admin/
├── Dashboard.jsx
├── Complaints.jsx
├── Users.jsx
├── Departments.jsx
└── Analytics.jsx

// frontend/src/components/dashboard/
├── StatCard.jsx
├── ComplaintChart.jsx
├── DepartmentTable.jsx
└── RecentActivity.jsx
```

---

### Week 4: SMS/IVR Integration

#### Day 1-3: SMS Gateway Integration

**Tasks**:
- [ ] Set up Twilio account (or MSG91 for India)
- [ ] Create SMS webhook endpoint
- [ ] Implement SMS parser (extract keywords, location)
- [ ] Create complaint from SMS
- [ ] Send confirmation SMS
- [ ] Implement SMS status updates
- [ ] Test with real phone numbers
- [ ] Set up toll-free number (if using Twilio)

**SMS Parser**:
```javascript
// backend/src/services/smsService.js
class SMSService {
  
  parseSMS(message) {
    // "WATER leakage near Sector 5 market"
    const keywords = {
      'WATER': 'water_supply',
      'SAFAI': 'sanitation',
      'ROAD': 'roads'
    };
    
    const upperMsg = message.toUpperCase();
    let category = null;
    
    for (const [keyword, cat] of Object.entries(keywords)) {
      if (upperMsg.includes(keyword)) {
        category = cat;
        break;
      }
    }
    
    // Extract location (simple NLP)
    const locationMatch = message.match(/near\s+([^,]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : null;
    
    const description = message.replace(/^(WATER|SAFAI|ROAD)\s+/i, '');
    
    return { category, location, description };
  }
  
  async createComplaintFromSMS(phone, message) {
    const parsed = this.parseSMS(message);
    
    // Find or create citizen
    let citizen = await User.findOne({ phone, role: citizenRoleId });
    if (!citizen) {
      citizen = await User.create({
        phone,
        role: citizenRoleId,
        name: `Citizen ${phone.slice(-4)}`
      });
    }
    
    // Find category
    const category = await ComplaintCategory.findOne({ code: parsed.category });
    
    // Create complaint
    const complaint = await Complaint.create({
      citizen: { userId: citizen._id, phone },
      category: category._id,
      department: category.department,
      description: parsed.description,
      location: { address: parsed.location },
      source: 'sms',
      smsKeyword: parsed.category,
      priority: category.priority,
      status: 'filed'
    });
    
    // Send confirmation SMS
    await this.sendSMS(phone, 
      `Your complaint #${complaint.complaintId} has been registered. ` +
      `Track at citysamdhaan.gov.in/track/${complaint.complaintId}`
    );
    
    return complaint;
  }
}
```

**Twilio Webhook**:
```javascript
// backend/src/routes/sms.routes.js
router.post('/sms/inbound', async (req, res) => {
  const { From, Body } = req.body; // Twilio sends these
  
  try {
    const complaint = await smsService.createComplaintFromSMS(From, Body);
    res.status(200).send('<Response></Response>'); // TwiML response
  } catch (error) {
    console.error('SMS processing error:', error);
    await smsService.sendSMS(From, 'Error processing your complaint. Please try again.');
    res.status(200).send('<Response></Response>');
  }
});
```

---

#### Day 4-6: IVR System

**Tasks**:
- [ ] Design IVR call flow (menu tree)
- [ ] Create TwiML templates for IVR menus
- [ ] Implement speech-to-text for location input
- [ ] Create IVR webhook endpoints
- [ ] Record voice prompts in Hindi/English
- [ ] Upload voice prompts to Twilio/Cloudinary
- [ ] Test IVR flow with test calls
- [ ] Implement IVR session tracking

**IVR Call Flow**:
```xml
<!-- IVR Welcome Menu (TwiML) -->
<Response>
  <Gather action="/api/v1/ivr/complaint-menu" numDigits="1">
    <Say language="hi-IN">
      नमस्ते। सिटी समाधान में आपका स्वागत है।
    </Say>
    <Say language="en-IN">
      Welcome to City Samdhaan.
    </Say>
    <Say language="hi-IN">
      पानी की समस्या के लिए 1 दबाएं। 
      साफ़ सफ़ाई के लिए 2 दबाएं।
    </Say>
  </Gather>
</Response>
```

**IVR Controller**:
```javascript
// backend/src/controllers/ivrController.js
exports.complaintMenu = async (req, res) => {
  const { Digits, CallSid, From } = req.body;
  
  const categoryMap = {
    '1': 'water_supply',
    '2': 'sanitation',
    '3': 'roads'
  };
  
  const category = categoryMap[Digits];
  
  // Store in session
  await redis.hset(`ivr:${CallSid}`, 'category', category);
  await redis.hset(`ivr:${CallSid}`, 'phone', From);
  
  // Ask for location
  const twiml = `
    <Response>
      <Say language="hi-IN">कृपया अपना इलाका बोलें</Say>
      <Record action="/api/v1/ivr/location-input" 
              transcribe="true" 
              transcribeCallback="/api/v1/ivr/transcription"
              maxLength="30" />
    </Response>
  `;
  
  res.type('text/xml').send(twiml);
};

exports.locationInput = async (req, res) => {
  const { CallSid, RecordingUrl, TranscriptionText } = req.body;
  
  // Get session data
  const category = await redis.hget(`ivr:${CallSid}`, 'category');
  const phone = await redis.hget(`ivr:${CallSid}`, 'phone');
  
  // Create complaint
  const complaint = await complaintService.createFromIVR({
    phone,
    category,
    location: TranscriptionText,
    ivrSessionId: CallSid,
    voiceRecordingUrl: RecordingUrl
  });
  
  // Confirm
  const twiml = `
    <Response>
      <Say language="hi-IN">
        आपकी शिकायत दर्ज कर दी गई है। 
        शिकायत संख्या ${complaint.complaintId}
      </Say>
      <Hangup/>
    </Response>
  `;
  
  res.type('text/xml').send(twiml);
};
```

---

#### Day 7: Multi-Language Support

**Tasks**:
- [ ] Set up i18next for React
- [ ] Create translation files (Hindi, English, Marathi)
- [ ] Translate all UI text
- [ ] Add language switcher
- [ ] Test in all languages
- [ ] Record IVR prompts in regional languages

**i18n Setup**:
```javascript
// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      hi: { translation: require('./locales/hi.json') },
      mr: { translation: require('./locales/mr.json') }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
```

---

## Phase 3: Blockchain & Land Registry (Week 5-6)

### Week 5: Smart Contract Development

#### Day 1-2: ComplaintAnchor Contract

**Tasks**:
- [ ] Write ComplaintAnchor.sol
- [ ] Implement Merkle tree batching
- [ ] Write unit tests
- [ ] Deploy to local Hardhat network
- [ ] Test batch anchoring
- [ ] Deploy to Sepolia testnet
- [ ] Verify on Etherscan

**Contract**:
```solidity
// blockchain/contracts/core/ComplaintAnchor.sol
contract ComplaintAnchor {
  function anchorBatch(
    bytes32 merkleRoot,
    uint256 complaintCount,
    bytes32[] calldata complaintHashes
  ) external onlyAuthorized;
  
  function verifyComplaint(
    bytes32 complaintHash,
    bytes32[] calldata merkleProof,
    uint256 batchId
  ) external view returns (bool);
}
```

**Test**:
```javascript
// blockchain/test/ComplaintAnchor.test.js
describe("ComplaintAnchor", function () {
  it("Should anchor batch", async function () {
    const hashes = [keccak256("c1"), keccak256("c2")];
    const root = merkleRoot(hashes);
    await complaintAnchor.anchorBatch(root, 2, hashes);
    expect(await complaintAnchor.totalComplaints()).to.equal(2);
  });
});
```

---

#### Day 3-5: LandRegistry Contract

**Tasks**:
- [ ] Write LandRegistry.sol with AccessControl
- [ ] Implement property registration
- [ ] Implement transfer workflow (7 stages)
- [ ] Write comprehensive tests
- [ ] Deploy to Sepolia
- [ ] Verify on Etherscan
- [ ] Grant roles to test addresses

**Contract Functions**:
```solidity
// blockchain/contracts/core/LandRegistry.sol
function registerProperty(...) external onlyRole(REGISTRAR_ROLE);
function initiateTransfer(...) external;
function approveTransferStage(...) external;
function getOwnershipHistory(...) external view;
function verifyDocument(...) external view;
```

---

#### Day 6-7: Backend Blockchain Integration

**Tasks**:
- [ ] Create blockchain service with Ethers.js
- [ ] Implement Merkle tree builder utility
- [ ] Create Bull job for batch anchoring
- [ ] Implement complaint verification endpoint
- [ ] Add blockchain endpoints to API
- [ ] Test end-to-end flow (complaint → blockchain → verify)
- [ ] Update Complaint model with blockchain fields

**Blockchain Service**:
```javascript
// backend/src/services/blockchainService.js
class BlockchainService {
  async anchorComplaintBatch(complaints);
  async verifyComplaint(complaintId);
  async updateComplaintStatus(complaint, newStatus);
  async registerProperty(property);
  async initiateLandTransfer(transfer);
}
```

**Bull Job**:
```javascript
// Cron job: Every 1 hour OR when 100 complaints pending
const blockchainQueue = new Queue('blockchain-anchor');

blockchainQueue.process(async (job) => {
  const pendingComplaints = await Complaint.find({ isAnchored: false }).limit(100);
  await blockchainService.anchorComplaintBatch(pendingComplaints);
});
```

---

### Week 6: Land Registry Frontend & Testing

#### Day 1-3: Land Registry UI

**Tasks**:
- [ ] Create Property model in MongoDB
- [ ] Create LandTransfer model
- [ ] Build property registration page
- [ ] Build property transfer form
- [ ] Create approval workflow UI (multi-step form)
- [ ] Build ownership history page
- [ ] Implement document upload (Cloudinary)
- [ ] Add MetaMask integration for signatures

**Pages**:
```javascript
// frontend/src/pages/land/
├── MyProperties.jsx
├── RegisterProperty.jsx
├── TransferProperty.jsx
├── ApprovalQueue.jsx  // For officials
└── VerifyProperty.jsx  // Public verification
```

**MetaMask Integration**:
```javascript
// frontend/src/hooks/useWallet.js
export function useWallet() {
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return { account: accounts[0], provider, signer };
  };
  
  return { connectWallet };
}
```

---

#### Day 4-5: Document Verification

**Tasks**:
- [ ] Implement document hashing service
- [ ] Create verification endpoints
- [ ] Build verification UI
- [ ] Implement Aadhaar hash linking
- [ ] Test document tampering detection
- [ ] Create audit log viewer for admins

**Verification Flow**:
```javascript
// User uploads document → Hash generated → Stored on Cloudinary + MongoDB
// → Hash anchored on blockchain → User can verify anytime

// Verification endpoint
GET /api/v1/land/properties/:id/verify-document/:docId
// Returns: { verified: true, hash: "0x...", blockchainTx: "0x..." }
```

---

#### Day 6-7: Integration Testing & Bug Fixes

**Tasks**:
- [ ] End-to-end test: Register property → Transfer → Approve → Verify
- [ ] Test multi-sig workflow
- [ ] Test blockchain verification
- [ ] Test document upload/download
- [ ] Performance testing (batch anchoring)
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Fix bugs and edge cases
- [ ] Code refactoring

---

## Phase 4: Mobile App & Production Deployment (Week 7-8)

### Week 7: React Native Mobile App

#### Day 1-3: Mobile App Setup & Offline Features

**Tasks**:
- [ ] Initialize React Native project (Expo or CLI)
- [ ] Set up WatermelonDB for offline storage
- [ ] Configure offline sync logic
- [ ] Build login screen
- [ ] Build complaint filing screen (with camera)
- [ ] Implement location picker (GPS)
- [ ] Create offline queue for pending syncs

**Offline Sync**:
```javascript
// mobile/src/services/syncService.js
class SyncService {
  async syncPendingComplaints() {
    const pending = await database.collections
      .get('complaints')
      .query(Q.where('synced', false))
      .fetch();
    
    for (const complaint of pending) {
      try {
        const response = await api.post('/complaints', complaint._raw);
        await complaint.update(c => {
          c.synced = true;
          c.serverId = response.data.id;
        });
      } catch (error) {
        console.log('Sync failed, will retry');
      }
    }
  }
}
```

---

#### Day 4-7: Mobile Features

**Tasks**:
- [ ] Build complaint list screen
- [ ] Build complaint detail screen
- [ ] Implement push notifications (FCM)
- [ ] Add offline indicator
- [ ] Build settings screen (language, profile)
- [ ] Test on Android and iOS
- [ ] Optimize for low-end devices
- [ ] Create APK/IPA builds

---

### Week 8: Production Deployment

#### Day 1-3: Server Setup

**Tasks**:
- [ ] Set up VPS (AWS EC2, DigitalOcean, or Azure)
- [ ] Install Node.js, MongoDB, Redis, Nginx
- [ ] Configure SSL certificates (Let's Encrypt)
- [ ] Set up PM2 for process management
- [ ] Configure Nginx reverse proxy
- [ ] Set up MongoDB replica set
- [ ] Configure Redis cluster
- [ ] Set up monitoring (New Relic, DataDog)

**Server Architecture**:
```
Domain: citysamdhaan.gov.in
    ↓
Cloudflare CDN (DDoS protection, SSL)
    ↓
Nginx Load Balancer (443 → 5000)
    ↓
PM2 (2 Node.js instances)
    ↓
MongoDB Replica Set (3 nodes)
    ↓
Redis Cluster (2 nodes)
```

---

#### Day 4-5: Deployment & CI/CD

**Tasks**:
- [ ] Create Dockerfile for backend
- [ ] Create docker-compose for production
- [ ] Set up GitHub Actions for CI/CD
- [ ] Deploy backend to server
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy smart contracts to Sepolia mainnet
- [ ] Configure environment variables
- [ ] Set up database backups (daily)

**GitHub Actions**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: |
          ssh user@server 'cd /app && git pull && pm2 restart all'
      - name: Deploy Frontend
        run: |
          cd frontend && npm run build
          vercel --prod
```

---

#### Day 6: Testing & Monitoring

**Tasks**:
- [ ] Smoke testing on production
- [ ] Load testing (Artillery, k6)
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Create admin alerts (Slack/email)
- [ ] Test SMS/IVR on production numbers
- [ ] Test blockchain anchoring on mainnet

**Load Test**:
```bash
# Install k6
brew install k6

# Test complaint creation
k6 run --vus 100 --duration 30s load-test.js
```

---

#### Day 7: Documentation & Handover

**Tasks**:
- [ ] Write API documentation (Swagger)
- [ ] Create user manual (PDF)
- [ ] Record demo video
- [ ] Create admin training materials
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Final code review and cleanup

---

## Agent-Ready TODO Checklist

### Backend Development

#### Authentication & User Management
- [ ] Set up Express server with middleware (cors, helmet, morgan)
- [ ] Create MongoDB connection with Mongoose
- [ ] Design User, Role, Department, ComplaintCategory schemas
- [ ] Implement JWT authentication (login, register, refresh)
- [ ] Create OTP service using Twilio
- [ ] Build RBAC middleware for role-based access
- [ ] Set up Redis for session and OTP storage
- [ ] Create auth routes and controllers
- [ ] Write unit tests for authentication module

#### Complaint Management
- [ ] Design Complaint, ComplaintUpdate, AuditLog schemas
- [ ] Create complaint CRUD operations
- [ ] Implement status workflow (filed → acknowledged → in_progress → resolved → closed)
- [ ] Build file upload middleware with Multer + Cloudinary
- [ ] Implement SLA calculation logic
- [ ] Create Bull queue for SLA monitoring
- [ ] Build complaint assignment logic
- [ ] Create complaint history tracking
- [ ] Write API tests for complaint module

#### Department & Analytics
- [ ] Create department CRUD operations
- [ ] Build complaint category management
- [ ] Implement analytics service (stats, trends, SLA compliance)
- [ ] Create dashboard endpoints
- [ ] Build report generation (CSV export)

#### SMS/IVR Integration
- [ ] Set up Twilio account and credentials
- [ ] Create SMS parser to extract keywords
- [ ] Build SMS webhook endpoint
- [ ] Implement complaint creation from SMS
- [ ] Create IVR call flow with TwiML
- [ ] Record voice prompts (Hindi/English)
- [ ] Build IVR webhook endpoints
- [ ] Implement speech-to-text for location input
- [ ] Test SMS/IVR end-to-end

#### Notifications & Real-Time
- [ ] Set up Socket.io server
- [ ] Implement real-time complaint status updates
- [ ] Create SMS notification service
- [ ] Build email notification service (optional)
- [ ] Create Bull queues for background jobs

---

### Frontend Development

#### Core Setup
- [ ] Initialize React + Vite project
- [ ] Configure Tailwind CSS
- [ ] Set up React Router v6
- [ ] Create Axios instance with interceptors
- [ ] Build authentication context
- [ ] Set up React Query for server state

#### Authentication Pages
- [ ] Build Login page
- [ ] Build Register page
- [ ] Build OTP verification page
- [ ] Create protected route wrapper
- [ ] Implement auto-logout on token expiry

#### Citizen Portal
- [ ] Build complaint filing form with photo upload
- [ ] Create complaint list with filters
- [ ] Build complaint detail page with status timeline
- [ ] Create complaint tracking page (public, no login)
- [ ] Implement location picker (Leaflet or Google Maps)
- [ ] Add real-time status updates with Socket.io

#### Admin Dashboard
- [ ] Build dashboard with statistics cards
- [ ] Create complaint management table
- [ ] Build user management CRUD
- [ ] Create department management page
- [ ] Implement charts for analytics (Recharts)
- [ ] Build SLA monitoring view
- [ ] Add CSV export functionality

#### Land Registry
- [ ] Build property registration form
- [ ] Create property list page
- [ ] Build property transfer form
- [ ] Implement multi-step approval UI
- [ ] Create ownership history viewer
- [ ] Build property verification page
- [ ] Add MetaMask wallet integration

#### Common Components
- [ ] Create Button, Input, Card, Modal components
- [ ] Build Navbar with role-based menu
- [ ] Create Footer
- [ ] Build Loader/Spinner
- [ ] Create Toast notifications (react-hot-toast)

---

### Blockchain Development

#### Smart Contracts
- [ ] Write ComplaintAnchor.sol with Merkle tree batching
- [ ] Write LandRegistry.sol with multi-sig workflow
- [ ] Write AuditLogger.sol for tamper-proof logs
- [ ] Write DocumentVerification.sol for signature verification
- [ ] Add OpenZeppelin contracts (AccessControl, Ownable, ReentrancyGuard)
- [ ] Write comprehensive unit tests
- [ ] Deploy to local Hardhat network
- [ ] Deploy to Sepolia testnet
- [ ] Verify contracts on Etherscan

#### Backend Integration
- [ ] Create blockchain service with Ethers.js
- [ ] Implement Merkle tree builder
- [ ] Create Bull job for batch anchoring (every 100 complaints)
- [ ] Build complaint verification endpoint
- [ ] Implement property registration on blockchain
- [ ] Build land transfer workflow integration
- [ ] Add audit logging to blockchain
- [ ] Create blockchain verification endpoints

#### Frontend Integration
- [ ] Add MetaMask connection
- [ ] Build wallet address linking
- [ ] Create blockchain verification UI
- [ ] Show transaction hashes and Etherscan links
- [ ] Display gas estimates for transactions

---

### Mobile App Development
- [ ] Initialize React Native project
- [ ] Set up WatermelonDB for offline storage
- [ ] Build login screen
- [ ] Create complaint filing with camera
- [ ] Implement GPS location picker
- [ ] Build offline sync queue
- [ ] Create complaint list and detail screens
- [ ] Add push notifications (FCM)
- [ ] Test on Android and iOS
- [ ] Create APK/IPA builds

---

### DevOps & Deployment
- [ ] Create Dockerfile for backend
- [ ] Write docker-compose.yml for local development
- [ ] Set up GitHub Actions for CI/CD
- [ ] Configure production server (VPS)
- [ ] Install Node.js, MongoDB, Redis, Nginx
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure PM2 for process management
- [ ] Set up MongoDB backups
- [ ] Deploy backend to production
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy contracts to Ethereum mainnet
- [ ] Set up monitoring (Sentry, UptimeRobot)

---

### Testing
- [ ] Write unit tests for backend (Jest)
- [ ] Write integration tests for API endpoints
- [ ] Test RBAC middleware
- [ ] Test file upload flow
- [ ] Write smart contract tests (Hardhat)
- [ ] Test blockchain integration end-to-end
- [ ] Perform load testing (k6 or Artillery)
- [ ] Security testing (SQL injection, XSS)
- [ ] Test on low-end mobile devices
- [ ] User acceptance testing (UAT)

---

### Documentation
- [ ] Generate API documentation (Swagger)
- [ ] Write user manual (citizen, officer, admin)
- [ ] Document deployment process
- [ ] Create admin training materials
- [ ] Write troubleshooting guide
- [ ] Record demo video
- [ ] Document codebase (inline comments)

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Complaint Registration (Web)** | <30 seconds | Time from form submit to confirmation |
| **Complaint Registration (SMS)** | <1 minute | Time from SMS to confirmation SMS |
| **IVR Call Completion** | >80% | Successful complaint registration rate |
| **Blockchain Anchoring** | <5 minutes | Time from complaint to blockchain tx |
| **API Response Time** | <200ms (p95) | Backend API latency |
| **Mobile App Offline Mode** | 100% | All features work without internet |
| **SLA Compliance** | >85% | Complaints resolved within SLA |
| **Zero Blockchain Tampering** | 100% | No successful document tampering |
| **Multi-Language Support** | 3+ languages | Hindi, English, Marathi |
| **Test Coverage** | >70% | Unit + integration tests |

---

## Resources Required

### Development
- **Backend Developer**: Node.js, Express, MongoDB, Redis
- **Frontend Developer**: React, Tailwind, Web3
- **Blockchain Developer**: Solidity, Hardhat, Ethers.js
- **Mobile Developer**: React Native, offline sync

### Infrastructure
- **VPS**: 4 vCPU, 8GB RAM (AWS EC2 t3.large or equivalent)
- **MongoDB**: 50GB storage (managed service or self-hosted)
- **Redis**: 4GB memory
- **Cloudinary**: 25GB storage + 25GB bandwidth
- **Twilio**: $100/month for SMS/IVR (India rates)
- **Domain**: citysamdhaan.gov.in (requires government approval)
- **SSL**: Free (Let's Encrypt)

### Third-Party Services
- **Twilio/MSG91**: SMS and voice calls
- **Cloudinary**: File storage
- **Infura/Alchemy**: Ethereum RPC provider
- **GitHub**: Version control and CI/CD
- **Vercel/Netlify**: Frontend hosting
- **Sentry**: Error tracking
- **UptimeRobot**: Uptime monitoring

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Blockchain gas fees spike** | High | Medium | Use batch anchoring, move to L2 (Polygon) |
| **Twilio SMS costs** | Medium | High | Switch to MSG91 (cheaper for India) |
| **MongoDB data loss** | Critical | Low | Daily backups to S3, replica set |
| **Smart contract bug** | Critical | Low | Comprehensive tests, audit, upgradeable contracts |
| **Server downtime** | High | Low | Load balancing, PM2 auto-restart, monitoring |
| **Aadhaar integration delay** | Medium | High | Build without Aadhaar first, add later |
| **Mobile app approval delay** | Low | Medium | Deploy as PWA first, native app later |

---

## Post-Launch Roadmap

### Phase 5: Enhancements (Week 9-12)
- [ ] Add facial recognition for Aadhaar verification (optional)
- [ ] Integrate with DigiLocker for document retrieval
- [ ] Build WhatsApp bot for complaints
- [ ] Add AI chatbot for FAQs
- [ ] Implement predictive analytics (complaint hotspots)
- [ ] Add support for 5+ regional languages
- [ ] Build citizen feedback survey
- [ ] Create public complaint heatmap

### Phase 6: Scale (Month 4-6)
- [ ] Multi-city deployment (tenant isolation)
- [ ] Integration with existing government portals
- [ ] Partnership with UIDAI for Aadhaar
- [ ] Move to Ethereum mainnet or Polygon
- [ ] Open-source selected modules
- [ ] Build API marketplace for third-party integrations

---

## Contact & Support

**Project Lead**: CitySamdhaan Team  
**Email**: support@citysamdhaan.gov.in  
**GitHub**: https://github.com/PushkarJaiswal06/CitySamadhaan  
**Documentation**: https://docs.citysamdhaan.gov.in

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2025  
**Status**: Ready for Implementation 🚀
