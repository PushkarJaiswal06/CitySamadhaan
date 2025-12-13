# CitySamdhaan - Technical Architecture

## System Architecture Overview

```
┌─────────────────────── USER CHANNELS ───────────────────────┐
│                                                              │
│  📱 Basic Phone    📲 SMS      ☎️ IVR      📱 Mobile App    │
│  (Voice Call)      Gateway     System     (React Native)    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   NGINX/Caddy   │  ← Load Balancer
                  │  (Reverse Proxy)│
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌─────▼──────┐    ┌─────▼──────┐
   │  React   │      │  Express   │    │  Socket.io │
   │  (Vite)  │      │   API      │    │  (Real-time)│
   │  Port    │      │  Port 5000 │    │  Port 5001 │
   │  5173    │      └─────┬──────┘    └─────┬──────┘
   └──────────┘            │                  │
                           │                  │
        ┌──────────────────┴──────────────────┴─────────────┐
        │                                                    │
   ┌────▼─────┐    ┌─────────┐    ┌──────────┐    ┌────────▼────┐
   │ MongoDB  │    │  Redis  │    │Cloudinary│    │  Twilio/    │
   │ Port     │    │  Cache  │    │   API    │    │  MSG91 API  │
   │ 27017    │    │  Queue  │    └──────────┘    └─────────────┘
   └────┬─────┘    └────┬────┘
        │               │
        └───────┬───────┘
                │
        ┌───────▼────────┐
        │  Blockchain    │
        │  Service       │
        │  (Ethers.js)   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Ethereum      │
        │  Sepolia       │
        │  Testnet       │
        └────────────────┘
```

---

## Technology Stack (MERN)

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI library |
| **Vite** | 5.0+ | Build tool (faster than CRA) |
| **React Router** | 6.20+ | Client-side routing |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **Axios** | 1.6+ | HTTP client |
| **React Query** | 5.0+ | Server state management |
| **Zustand** | 4.4+ | Client state management |
| **React Hook Form** | 7.49+ | Form handling |
| **Recharts** | 2.10+ | Charts for dashboard |
| **React Hot Toast** | 2.4+ | Notifications |
| **i18next** | 23.7+ | Internationalization |
| **Ethers.js** | 6.9+ | Blockchain interaction (frontend wallet) |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 LTS | Runtime |
| **Express.js** | 4.18+ | Web framework |
| **Mongoose** | 8.0+ | MongoDB ODM |
| **bcrypt** | 5.1+ | Password hashing |
| **jsonwebtoken** | 9.0+ | JWT authentication |
| **express-validator** | 7.0+ | Request validation |
| **multer** | 1.4+ | File upload handling |
| **cloudinary** | 1.41+ | Image/file storage |
| **twilio** | 4.19+ | SMS/IVR integration |
| **bull** | 4.12+ | Job queue |
| **ioredis** | 5.3+ | Redis client |
| **socket.io** | 4.6+ | WebSocket for real-time updates |
| **ethers** | 6.9+ | Blockchain interaction |
| **dotenv** | 16.3+ | Environment variables |
| **helmet** | 7.1+ | Security headers |
| **cors** | 2.8+ | CORS handling |
| **morgan** | 1.10+ | HTTP logging |
| **winston** | 3.11+ | Application logging |

### Database & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| **MongoDB** | 7.0+ | Primary database |
| **Redis** | 7.2+ | Cache, sessions, job queue |
| **Cloudinary** | N/A | File storage (images, PDFs, voice) |

### Blockchain

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.19 | Smart contract language |
| **Hardhat** | 2.19+ | Development environment |
| **OpenZeppelin** | 5.0+ | Smart contract libraries |
| **Ethers.js** | 6.9+ | Web3 library |
| **Sepolia Testnet** | N/A | Ethereum test network |

### DevOps & Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.23+ | Multi-container orchestration |
| **GitHub Actions** | N/A | CI/CD |
| **PM2** | 5.3+ | Process manager |
| **Nginx** | 1.24+ | Reverse proxy |

---

## Folder Structure

```
CitySamdhaan/
├── .docs/                           # All documentation
│   ├── 01-PROJECT-OVERVIEW.md
│   ├── 02-TECHNICAL-ARCHITECTURE.md
│   ├── 03-BLOCKCHAIN-INTEGRATION.md
│   ├── 04-LAND-REGISTRY-MODULE.md
│   └── 05-DEVELOPMENT-ROADMAP.md
│
├── backend/                         # Node.js + Express API
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── redis.js             # Redis connection
│   │   │   ├── cloudinary.js        # Cloudinary config
│   │   │   ├── twilio.js            # Twilio/SMS config
│   │   │   └── blockchain.js        # Ethers.js provider setup
│   │   │
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Role.js
│   │   │   ├── Complaint.js
│   │   │   ├── Department.js
│   │   │   ├── Property.js
│   │   │   ├── LandTransfer.js
│   │   │   ├── AuditLog.js
│   │   │   └── index.js             # Export all models
│   │   │
│   │   ├── controllers/             # Route handlers
│   │   │   ├── authController.js    # Login, register, OTP
│   │   │   ├── complaintController.js
│   │   │   ├── departmentController.js
│   │   │   ├── userController.js
│   │   │   ├── landRegistryController.js
│   │   │   ├── smsController.js
│   │   │   ├── ivrController.js
│   │   │   └── analyticsController.js
│   │   │
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.js       # /api/auth/*
│   │   │   ├── complaint.routes.js  # /api/complaints/*
│   │   │   ├── department.routes.js # /api/departments/*
│   │   │   ├── user.routes.js       # /api/users/*
│   │   │   ├── land.routes.js       # /api/land/*
│   │   │   ├── sms.routes.js        # /api/sms/* (webhook)
│   │   │   ├── ivr.routes.js        # /api/ivr/* (webhook)
│   │   │   └── index.js             # Combine all routes
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── rbac.middleware.js   # Role-based access control
│   │   │   ├── validate.middleware.js # Request validation
│   │   │   ├── upload.middleware.js # Multer + Cloudinary
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── complaintService.js  # Complaint CRUD + workflow
│   │   │   ├── smsService.js        # Parse SMS, send SMS
│   │   │   ├── ivrService.js        # TwiML generation
│   │   │   ├── blockchainService.js # Anchor data on blockchain
│   │   │   ├── landRegistryService.js
│   │   │   ├── notificationService.js
│   │   │   ├── fileService.js       # Cloudinary upload/delete
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── jobs/                    # Bull queue jobs
│   │   │   ├── blockchainAnchor.job.js # Batch complaints every 100
│   │   │   ├── smsNotification.job.js
│   │   │   ├── slaMonitor.job.js    # Check SLA violations
│   │   │   └── offlineSync.job.js   # Process mobile app syncs
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── logger.js            # Winston logger
│   │   │   ├── validators.js        # Custom validators
│   │   │   ├── constants.js         # App constants
│   │   │   ├── helpers.js           # Utility functions
│   │   │   └── merkleTree.js        # Merkle tree for batching
│   │   │
│   │   ├── sockets/                 # Socket.io handlers
│   │   │   ├── complaintSocket.js   # Real-time complaint updates
│   │   │   └── index.js
│   │   │
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Entry point
│   │
│   ├── tests/                       # Jest tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── nodemon.json
│
├── frontend/                        # React + Vite
│   ├── public/
│   │   ├── locales/                 # i18n translation files
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   └── mr.json
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── assets/                  # Images, icons
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   │
│   │   │   ├── complaint/
│   │   │   │   ├── ComplaintForm.jsx
│   │   │   │   ├── ComplaintCard.jsx
│   │   │   │   ├── ComplaintDetail.jsx
│   │   │   │   ├── ComplaintList.jsx
│   │   │   │   └── StatusTimeline.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── ComplaintChart.jsx
│   │   │   │   ├── DepartmentTable.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   │
│   │   │   └── land/
│   │   │       ├── PropertyCard.jsx
│   │   │       ├── TransferForm.jsx
│   │   │       ├── ApprovalStage.jsx
│   │   │       └── OwnershipHistory.jsx
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── OTPVerification.jsx
│   │   │   │
│   │   │   ├── citizen/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── FileComplaint.jsx
│   │   │   │   ├── TrackComplaint.jsx
│   │   │   │   ├── MyComplaints.jsx
│   │   │   │   └── Schemes.jsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Complaints.jsx
│   │   │   │   ├── Departments.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── Settings.jsx
│   │   │   │
│   │   │   └── land/
│   │   │       ├── MyProperties.jsx
│   │   │       ├── RegisterProperty.jsx
│   │   │       ├── TransferProperty.jsx
│   │   │       ├── ApprovalQueue.jsx
│   │   │       └── VerifyProperty.jsx
│   │   │
│   │   ├── services/                # API calls
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── complaintService.js
│   │   │   ├── departmentService.js
│   │   │   ├── landService.js
│   │   │   └── blockchainService.js # Web3 calls
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useComplaints.js
│   │   │   ├── useSocket.js
│   │   │   └── useWallet.js         # MetaMask integration
│   │   │
│   │   ├── store/                   # Zustand state
│   │   │   ├── authStore.js
│   │   │   ├── complaintStore.js
│   │   │   └── uiStore.js
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── constants.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind imports
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── mobile/                          # React Native (future)
│   └── README.md
│
├── blockchain/                      # Hardhat project
│   ├── contracts/
│   │   ├── core/
│   │   │   ├── LandRegistry.sol
│   │   │   ├── ComplaintAnchor.sol
│   │   │   └── AuditLogger.sol
│   │   │
│   │   ├── security/
│   │   │   ├── DocumentVerification.sol
│   │   │   ├── MultiPartyApproval.sol
│   │   │   └── AadhaarVerification.sol
│   │   │
│   │   └── libraries/
│   │       ├── DocumentHasher.sol
│   │       └── MerkleVerifier.sol
│   │
│   ├── scripts/
│   │   ├── deploy.js
│   │   ├── upgrade.js
│   │   └── verify.js
│   │
│   ├── test/
│   │   ├── LandRegistry.test.js
│   │   ├── ComplaintAnchor.test.js
│   │   └── integration.test.js
│   │
│   ├── hardhat.config.js
│   ├── .env.example
│   └── package.json
│
├── docker/                          # Docker configs
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── package.json                     # Root package.json
```

---

## MongoDB Database Schema

### Collections Overview

```
CitySamdhaan Database
├── users                   # All user accounts
├── roles                   # Role definitions
├── departments             # Government departments
├── complaint_categories    # Complaint types
├── complaints              # Main complaint data
├── complaint_updates       # Status update history
├── properties              # Land registry properties
├── land_transfers          # Property transfer requests
├── audit_logs              # Comprehensive audit trail
├── sms_logs                # SMS send/receive history
├── ivr_sessions            # IVR call records
└── blockchain_batches      # Batched blockchain anchors
```

---

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  phone: String,              // Required, unique, indexed
  phoneVerified: Boolean,
  email: String,              // Optional
  emailVerified: Boolean,
  password: String,           // bcrypt hashed
  name: String,
  role: ObjectId,             // Ref: roles
  department: ObjectId,       // Ref: departments (nullable)
  ward: {
    wardNumber: String,
    wardName: String
  },
  aadhaarHash: String,        // SHA-256 hash of Aadhaar (not actual number)
  walletAddress: String,      // Ethereum address for blockchain signing
  profilePhoto: {
    url: String,              // Cloudinary URL
    publicId: String
  },
  language: String,           // 'en', 'hi', 'mr', etc.
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
users.createIndex({ phone: 1 }, { unique: true })
users.createIndex({ email: 1 }, { unique: true, sparse: true })
users.createIndex({ role: 1 })
users.createIndex({ department: 1, ward.wardNumber: 1 })
users.createIndex({ walletAddress: 1 }, { unique: true, sparse: true })
```

---

### 2. Roles Collection

```javascript
{
  _id: ObjectId,
  name: String,               // "Citizen", "Field Worker", etc.
  slug: String,               // "citizen", "field_worker"
  description: String,
  permissions: [String],      // ["complaint:create", "complaint:view:own"]
  level: Number,              // Hierarchy level (1=citizen, 9=super_admin)
  createdAt: Date,
  updatedAt: Date
}

// Permissions format: "resource:action:scope"
// Examples:
// - "complaint:create:any"
// - "complaint:view:own"
// - "complaint:update:department"
// - "user:manage:any"
```

---

### 3. Departments Collection

```javascript
{
  _id: ObjectId,
  name: String,               // "Water Supply Department"
  nameLocal: String,          // "जल आपूर्ति विभाग"
  code: String,               // "WATER", unique
  parentDepartment: ObjectId, // Ref: departments (for sub-depts)
  headUser: ObjectId,         // Ref: users (department head)
  contactPhone: String,
  contactEmail: String,
  slaHours: {
    urgent: Number,           // P1 priority
    high: Number,             // P2 priority
    normal: Number,           // P3 priority
    low: Number               // P4 priority
  },
  wards: [String],            // Ward numbers covered
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
departments.createIndex({ code: 1 }, { unique: true })
departments.createIndex({ headUser: 1 })
```

---

### 4. Complaint Categories Collection

```javascript
{
  _id: ObjectId,
  department: ObjectId,       // Ref: departments
  name: String,               // "Water Leakage"
  nameLocal: String,          // "पानी का रिसाव"
  code: String,               // "WATER_LEAKAGE"
  keywords: [String],         // ["leakage", "leak", "risaw", "रिसाव"]
  priority: String,           // "urgent", "high", "normal", "low"
  slaHours: Number,           // Override department SLA if needed
  ivrMenuOption: Number,      // 1-9 for IVR
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
complaint_categories.createIndex({ department: 1 })
complaint_categories.createIndex({ keywords: 1 })
```

---

### 5. Complaints Collection (Main)

```javascript
{
  _id: ObjectId,
  complaintId: String,        // "CS12345" (auto-generated, unique)
  citizen: {
    userId: ObjectId,         // Ref: users (if registered)
    phone: String,            // Always captured
    name: String,
    aadhaarHash: String       // Optional
  },
  category: ObjectId,         // Ref: complaint_categories
  department: ObjectId,       // Ref: departments
  description: String,
  location: {
    address: String,
    landmark: String,
    ward: String,
    pincode: String,
    coordinates: {            // GeoJSON
      type: "Point",
      coordinates: [Number, Number] // [longitude, latitude]
    }
  },
  priority: String,           // "urgent", "high", "normal", "low"
  status: String,             // "filed", "acknowledged", "in_progress", "resolved", "closed"
  statusHistory: [{
    status: String,
    updatedBy: ObjectId,      // Ref: users
    remarks: String,
    timestamp: Date
  }],
  assignedTo: ObjectId,       // Ref: users (field worker/officer)
  attachments: [{
    type: String,             // "photo", "video", "audio", "document"
    url: String,              // Cloudinary URL
    publicId: String,
    uploadedAt: Date
  }],
  source: String,             // "web", "mobile", "sms", "ivr"
  smsKeyword: String,         // Original SMS keyword if SMS source
  ivrSessionId: String,       // If filed via IVR
  
  // Blockchain anchoring
  blockchainHash: String,     // Hash of complaint data
  blockchainBatchId: ObjectId,// Ref: blockchain_batches
  blockchainTxHash: String,   // Ethereum transaction hash
  isAnchored: Boolean,
  anchoredAt: Date,
  
  // SLA tracking
  slaDeadline: Date,
  slaBreach: Boolean,
  escalatedTo: ObjectId,      // Ref: users (if escalated)
  escalatedAt: Date,
  
  // Resolution
  resolvedAt: Date,
  resolvedBy: ObjectId,       // Ref: users
  resolutionRemarks: String,
  citizenFeedback: {
    rating: Number,           // 1-5
    comment: String,
    submittedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
complaints.createIndex({ complaintId: 1 }, { unique: true })
complaints.createIndex({ "citizen.phone": 1 })
complaints.createIndex({ "citizen.userId": 1 })
complaints.createIndex({ category: 1, status: 1 })
complaints.createIndex({ department: 1, status: 1 })
complaints.createIndex({ assignedTo: 1, status: 1 })
complaints.createIndex({ status: 1, slaDeadline: 1 })
complaints.createIndex({ "location.coordinates": "2dsphere" }) // Geo queries
complaints.createIndex({ createdAt: -1 })
complaints.createIndex({ blockchainTxHash: 1 }, { sparse: true })
```

---

### 6. Properties Collection (Land Registry)

```javascript
{
  _id: ObjectId,
  propertyId: String,         // "PROP-MH-MUM-001" (auto-generated, unique)
  surveyNumber: String,       // Government survey number
  location: {
    state: String,
    district: String,
    taluk: String,
    village: String,
    surveySubdivision: String
  },
  area: {
    value: Number,
    unit: String              // "sq_meters", "acres", "hectares"
  },
  currentOwner: ObjectId,     // Ref: users
  ownershipHistory: [{
    owner: ObjectId,          // Ref: users
    transferDeedHash: String, // Document hash
    timestamp: Date,
    blockchainTxHash: String
  }],
  propertyType: String,       // "residential", "commercial", "agricultural"
  status: String,             // "registered", "transfer_initiated", "under_dispute", "encumbered"
  
  // Documents (stored on Cloudinary)
  documents: [{
    type: String,             // "sale_deed", "title_deed", "encumbrance_cert", "mutation", "7_12_extract"
    url: String,              // Cloudinary URL (encrypted PDF)
    publicId: String,
    hash: String,             // SHA-256 hash for verification
    uploadedBy: ObjectId,     // Ref: users
    uploadedAt: Date,
    blockchainTxHash: String  // Anchored on blockchain
  }],
  
  // Blockchain anchoring
  blockchainPropertyId: String, // bytes32 from smart contract
  blockchainTxHash: String,   // Initial registration tx
  isAnchored: Boolean,
  anchoredAt: Date,
  
  // Tax & valuation
  taxAssessment: {
    annualValue: Number,
    lastAssessmentDate: Date
  },
  
  registrationDetails: {
    registeredBy: ObjectId,   // Ref: users (registrar)
    registrationDate: Date,
    registrationOffice: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
properties.createIndex({ propertyId: 1 }, { unique: true })
properties.createIndex({ surveyNumber: 1, "location.district": 1 })
properties.createIndex({ currentOwner: 1 })
properties.createIndex({ blockchainPropertyId: 1 }, { unique: true, sparse: true })
properties.createIndex({ status: 1 })
```

---

### 7. Land Transfers Collection

```javascript
{
  _id: ObjectId,
  transferId: String,         // "TRN-001" (auto-generated, unique)
  property: ObjectId,         // Ref: properties
  seller: ObjectId,           // Ref: users
  buyer: ObjectId,            // Ref: users
  saleAmount: Number,
  
  currentStage: String,       // "agreement_signed", "stamp_duty_paid", "documents_verified", 
                              // "registrar_approved", "mutation_initiated", "mutation_completed"
  
  stageHistory: [{
    stage: String,
    approvedBy: ObjectId,     // Ref: users (government official)
    approverRole: String,     // "surveyor", "sub_registrar", "tehsildar"
    supportingDocHash: String,
    timestamp: Date,
    blockchainTxHash: String
  }],
  
  documents: [{
    type: String,             // "sale_agreement", "stamp_duty_receipt", "identity_proof"
    url: String,
    publicId: String,
    hash: String,
    uploadedBy: ObjectId,
    uploadedAt: Date
  }],
  
  // Multi-party approvals
  approvals: [{
    role: String,             // "surveyor", "sub_registrar", "tehsildar", "revenue_inspector"
    user: ObjectId,           // Ref: users
    approved: Boolean,
    remarks: String,
    timestamp: Date,
    signature: String         // Digital signature (from MetaMask)
  }],
  
  // Blockchain
  blockchainTransferId: String, // bytes32 from smart contract
  blockchainTxHashes: [String], // Multiple txs for each stage
  
  status: String,             // "initiated", "pending_approvals", "approved", "completed", "rejected"
  initiatedAt: Date,
  completedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
land_transfers.createIndex({ transferId: 1 }, { unique: true })
land_transfers.createIndex({ property: 1, status: 1 })
land_transfers.createIndex({ seller: 1 })
land_transfers.createIndex({ buyer: 1 })
land_transfers.createIndex({ currentStage: 1, status: 1 })
```

---

### 8. Audit Logs Collection

```javascript
{
  _id: ObjectId,
  entityType: String,         // "complaint", "property", "user", "land_transfer"
  entityId: ObjectId,         // Reference to the entity
  action: String,             // "create", "update", "delete", "approve", "reject"
  actor: ObjectId,            // Ref: users (who performed action)
  changes: Object,            // Detailed changes (before/after)
  ipAddress: String,
  userAgent: String,
  blockchainTxHash: String,   // If action was anchored on blockchain
  timestamp: Date,
  createdAt: Date
}

// Indexes
audit_logs.createIndex({ entityType: 1, entityId: 1 })
audit_logs.createIndex({ actor: 1, timestamp: -1 })
audit_logs.createIndex({ timestamp: -1 })
audit_logs.createIndex({ blockchainTxHash: 1 }, { sparse: true })
```

---

### 9. SMS Logs Collection

```javascript
{
  _id: ObjectId,
  direction: String,          // "inbound", "outbound"
  phone: String,
  message: String,
  keyword: String,            // Extracted keyword (WATER, SAFAI, etc.)
  complaintId: String,        // Associated complaint if created
  twilioSid: String,          // Twilio message SID
  status: String,             // "sent", "delivered", "failed"
  errorCode: String,
  cost: Number,
  timestamp: Date,
  createdAt: Date
}

// Indexes
sms_logs.createIndex({ phone: 1, timestamp: -1 })
sms_logs.createIndex({ complaintId: 1 })
sms_logs.createIndex({ timestamp: -1 })
```

---

### 10. IVR Sessions Collection

```javascript
{
  _id: ObjectId,
  sessionId: String,          // Unique session ID
  phone: String,
  callSid: String,            // Twilio call SID
  language: String,           // Selected language
  menuPath: [Number],         // [1, 2] = Main menu -> Water
  voiceInputs: [{
    prompt: String,
    transcript: String,       // Speech-to-text result
    timestamp: Date
  }],
  complaintId: String,        // If complaint was filed
  duration: Number,           // Call duration in seconds
  status: String,             // "completed", "abandoned", "failed"
  createdAt: Date,
  updatedAt: Date
}

// Indexes
ivr_sessions.createIndex({ phone: 1, createdAt: -1 })
ivr_sessions.createIndex({ complaintId: 1 })
ivr_sessions.createIndex({ sessionId: 1 }, { unique: true })
```

---

### 11. Blockchain Batches Collection

```javascript
{
  _id: ObjectId,
  batchId: Number,            // Sequential batch number
  merkleRoot: String,         // Root hash of complaint batch
  complaintHashes: [String],  // Individual complaint hashes
  complaintIds: [String],     // Complaint IDs in this batch
  transactionHash: String,    // Ethereum tx hash
  blockNumber: Number,
  network: String,            // "sepolia", "mainnet"
  status: String,             // "pending", "confirmed", "failed"
  gasUsed: String,
  gasCost: String,
  createdAt: Date,
  confirmedAt: Date
}

// Indexes
blockchain_batches.createIndex({ batchId: 1 }, { unique: true })
blockchain_batches.createIndex({ transactionHash: 1 }, { unique: true, sparse: true })
blockchain_batches.createIndex({ status: 1 })
```

---

## REST API Endpoints

### Base URL: `/api/v1`

### Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user (OTP sent) | Public |
| POST | `/auth/verify-otp` | Verify OTP and activate account | Public |
| POST | `/auth/login` | Login with phone/email + password | Public |
| POST | `/auth/refresh-token` | Refresh JWT token | Authenticated |
| POST | `/auth/logout` | Logout (invalidate token) | Authenticated |
| POST | `/auth/forgot-password` | Request password reset OTP | Public |
| POST | `/auth/reset-password` | Reset password with OTP | Public |
| GET | `/auth/me` | Get current user profile | Authenticated |

---

### Complaint Endpoints (`/complaints`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/complaints` | List complaints (filtered by role) | Authenticated |
| POST | `/complaints` | File new complaint | Authenticated |
| GET | `/complaints/:id` | Get complaint details | Authenticated |
| PATCH | `/complaints/:id/status` | Update complaint status | Officer+ |
| PATCH | `/complaints/:id/assign` | Assign to field worker | Officer+ |
| POST | `/complaints/:id/attachments` | Upload attachment | Authenticated |
| DELETE | `/complaints/:id/attachments/:attachmentId` | Delete attachment | Authenticated |
| POST | `/complaints/:id/feedback` | Submit citizen feedback | Citizen |
| GET | `/complaints/:id/history` | Get status history | Authenticated |
| GET | `/complaints/:id/blockchain` | Get blockchain proof | Authenticated |
| POST | `/complaints/:id/escalate` | Escalate complaint | Officer+ |

---

### Department Endpoints (`/departments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/departments` | List all departments | Public |
| POST | `/departments` | Create new department | System Admin |
| GET | `/departments/:id` | Get department details | Public |
| PATCH | `/departments/:id` | Update department | System Admin |
| DELETE | `/departments/:id` | Delete department | System Admin |
| GET | `/departments/:id/complaints` | Get dept complaints | Officer+ |
| GET | `/departments/:id/categories` | Get complaint categories | Public |

---

### User Management Endpoints (`/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | List users (filtered by role) | System Admin |
| POST | `/users` | Create new user | System Admin |
| GET | `/users/:id` | Get user profile | Authenticated |
| PATCH | `/users/:id` | Update user profile | Authenticated |
| DELETE | `/users/:id` | Deactivate user | System Admin |
| PATCH | `/users/:id/role` | Change user role | System Admin |
| PATCH | `/users/:id/department` | Assign department | System Admin |
| GET | `/users/:id/complaints` | Get user's complaints | Authenticated |

---

### Land Registry Endpoints (`/land`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/land/properties` | List properties | Authenticated |
| POST | `/land/properties` | Register new property | Registrar |
| GET | `/land/properties/:id` | Get property details | Authenticated |
| PATCH | `/land/properties/:id` | Update property | Registrar |
| GET | `/land/properties/:id/history` | Ownership history | Authenticated |
| POST | `/land/properties/:id/documents` | Upload property document | Registrar |
| GET | `/land/properties/:id/blockchain` | Get blockchain proof | Authenticated |
| POST | `/land/transfers` | Initiate property transfer | Property Owner |
| GET | `/land/transfers` | List transfers | Authenticated |
| GET | `/land/transfers/:id` | Get transfer details | Authenticated |
| POST | `/land/transfers/:id/approve` | Approve transfer stage | Authorized Official |
| POST | `/land/transfers/:id/reject` | Reject transfer | Authorized Official |
| GET | `/land/transfers/:id/blockchain` | Get blockchain proof | Authenticated |

---

### SMS Webhook Endpoints (`/sms`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/sms/inbound` | Twilio webhook for incoming SMS | Twilio |
| POST | `/sms/status` | Twilio delivery status callback | Twilio |

---

### IVR Webhook Endpoints (`/ivr`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/ivr/welcome` | IVR welcome menu (TwiML) | Twilio |
| POST | `/ivr/complaint-menu` | Complaint category menu | Twilio |
| POST | `/ivr/location-input` | Capture location via speech | Twilio |
| POST | `/ivr/confirm` | Confirm and register complaint | Twilio |
| POST | `/ivr/status` | Call status callback | Twilio |

---

### Analytics Endpoints (`/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/analytics/dashboard` | Dashboard statistics | Officer+ |
| GET | `/analytics/complaints` | Complaint analytics | Officer+ |
| GET | `/analytics/departments` | Department performance | City Admin |
| GET | `/analytics/sla` | SLA compliance report | Officer+ |
| GET | `/analytics/trends` | Trend analysis | City Admin |

---

## Cloudinary Integration

### File Upload Strategy

| File Type | Folder | Max Size | Format | Encryption |
|-----------|--------|----------|--------|------------|
| Complaint Photos | `/complaints/{complaintId}/` | 5 MB | JPG, PNG | No |
| Complaint Videos | `/complaints/{complaintId}/` | 20 MB | MP4 | No |
| Land Documents | `/land/documents/{propertyId}/` | 10 MB | PDF | Yes (AES-256) |
| User Profiles | `/users/profiles/` | 500 KB | JPG, PNG | No |
| IVR Recordings | `/ivr/recordings/` | 5 MB | MP3, WAV | No |

### Upload Process

```javascript
// backend/src/middleware/upload.middleware.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'citysamdhaan';
    
    if (file.fieldname === 'complaintPhoto') {
      folder = `complaints/${req.params.id}`;
    } else if (file.fieldname === 'landDocument') {
      folder = `land/documents/${req.params.id}`;
    }
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'pdf', 'mp4', 'mp3'],
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = upload;
```

### Document Hash Verification

```javascript
// Verify document integrity
const crypto = require('crypto');

function hashFile(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Before upload
const fileHash = hashFile(req.file.buffer);

// Store hash in MongoDB + blockchain
complaint.attachments.push({
  url: cloudinaryResult.secure_url,
  publicId: cloudinaryResult.public_id,
  hash: fileHash,
  uploadedAt: new Date()
});
```

---

## Redis Usage

### Use Cases

| Use Case | Key Pattern | TTL | Value Type |
|----------|-------------|-----|------------|
| Session Storage | `session:{userId}` | 24h | JSON |
| OTP Storage | `otp:{phone}` | 10min | String |
| Rate Limiting | `ratelimit:{ip}:{endpoint}` | 1h | Counter |
| Cache User Data | `user:{userId}` | 1h | JSON |
| Cache Complaints | `complaints:{filter_hash}` | 15min | JSON |
| Job Queue | `bull:{jobName}` | N/A | Bull Queue |
| Real-time Counters | `stats:{date}:{type}` | 7d | Hash |

---

### Bull Job Queues

```javascript
// backend/src/jobs/blockchainAnchor.job.js
const Queue = require('bull');
const blockchainService = require('../services/blockchainService');

const blockchainQueue = new Queue('blockchain-anchor', {
  redis: process.env.REDIS_URL
});

// Process every 100 complaints or 1 hour
blockchainQueue.process(async (job) => {
  const { complaintHashes } = job.data;
  
  // Create Merkle tree
  const merkleRoot = blockchainService.createMerkleRoot(complaintHashes);
  
  // Anchor on Sepolia
  const txHash = await blockchainService.anchorBatch(merkleRoot, complaintHashes);
  
  return { txHash, merkleRoot };
});

// Schedule job
async function scheduleBlockchainAnchor(complaints) {
  await blockchainQueue.add({
    complaintHashes: complaints.map(c => c.blockchainHash)
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000 // 1 minute
    }
  });
}
```

---

## Socket.io Real-Time Updates

### Events

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `complaint:created` | Server → Client | `{ complaintId, status }` | New complaint filed |
| `complaint:updated` | Server → Client | `{ complaintId, status, updatedBy }` | Status changed |
| `complaint:assigned` | Server → Client | `{ complaintId, assignedTo }` | Complaint assigned |
| `complaint:resolved` | Server → Client | `{ complaintId }` | Complaint resolved |
| `land:transfer:approved` | Server → Client | `{ transferId, stage }` | Transfer stage approved |
| `notification` | Server → Client | `{ message, type, data }` | General notification |

---

### Socket.io Server Setup

```javascript
// backend/src/sockets/index.js
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');

function initSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join room based on role
    if (socket.role === 'field_worker') {
      socket.join(`department:${socket.departmentId}`);
    } else if (socket.role === 'citizen') {
      socket.join(`user:${socket.userId}`);
    }
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
  
  return io;
}

module.exports = initSocket;
```

---

## Security Measures

### Authentication & Authorization

1. **JWT Tokens**: Access token (1h) + Refresh token (7d)
2. **bcrypt**: Password hashing with salt rounds = 10
3. **OTP**: 6-digit OTP via SMS (10 min expiry)
4. **RBAC**: Role-based access control middleware
5. **Rate Limiting**: 100 req/15min per IP

### Data Protection

1. **Helmet.js**: Security headers
2. **CORS**: Whitelist frontend domains only
3. **Input Validation**: express-validator for all inputs
4. **SQL Injection**: Mongoose ORM (parameterized queries)
5. **XSS Protection**: Sanitize user inputs
6. **HTTPS Only**: SSL/TLS certificates (Let's Encrypt)

### Blockchain Security

1. **Private Keys**: Stored in AWS KMS / Hardware Security Module
2. **Multi-sig**: Land transfers require 3+ signatures
3. **Gas Limit**: Max gas per transaction to prevent drain
4. **Reentrancy Guard**: OpenZeppelin ReentrancyGuard

---

## Environment Variables

### Backend `.env`

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/citysamdhaan
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=1h
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio (SMS/IVR)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Blockchain (Sepolia)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_ethereum_private_key
LAND_REGISTRY_CONTRACT=0x...
COMPLAINT_ANCHOR_CONTRACT=0x...
AUDIT_LOGGER_CONTRACT=0x...

# Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

### Frontend `.env`

```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5001
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_SEPOLIA_CHAIN_ID=11155111
VITE_LAND_REGISTRY_CONTRACT=0x...
VITE_COMPLAINT_ANCHOR_CONTRACT=0x...
```

---

## Deployment Architecture

### Production Setup

```
┌──────────────────────────────────────────────────┐
│              Cloudflare CDN                      │
│         (DNS, DDoS Protection, SSL)              │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│              Nginx Load Balancer                 │
│         (Reverse Proxy, SSL Termination)         │
└──────────┬───────────────────────┬────────────────┘
           │                       │
    ┌──────▼──────┐         ┌──────▼──────┐
    │   Backend   │         │   Backend   │
    │  Instance 1 │         │  Instance 2 │
    │  (PM2)      │         │  (PM2)      │
    └──────┬──────┘         └──────┬──────┘
           │                       │
           └───────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
  │  MongoDB  │  │   Redis   │  │ Cloudinary│
  │  Replica  │  │  Cluster  │  │    CDN    │
  │    Set    │  └───────────┘  └───────────┘
  └───────────┘
```

---

## Next Steps

1. Review [Blockchain Integration](./03-BLOCKCHAIN-INTEGRATION.md) for smart contract details
2. Study [Land Registry Module](./04-LAND-REGISTRY-MODULE.md) for legal compliance
3. Follow [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md) for implementation phases

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2025  
**Authors**: CitySamdhaan Development Team
