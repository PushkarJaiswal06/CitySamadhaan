# CitySamdhaan - Project Overview

## Vision

To build inclusive governance systems where essential services reach every citizen, bridging the digital divide through technology that works for everyone, everywhere. CitySamdhaan enables rural, low-literacy, and non-smartphone users to access civic services through SMS, voice calls (IVR), offline-capable mobile apps, and web portals.

---

## Core Problems

The digital divide caused by:
- Poor connectivity and low digital literacy
- Complex online processes
- Lack of transparency in official records
- Inaccessible grievance redressal mechanisms
- Potential for corruption in land records and complaint handling

---

## Solution

**CitySamdhaan** is a multi-channel civic governance platform that:
- Enables complaint filing via **SMS keywords** (e.g., `WATER Sector 5`) or **voice calls (IVR)**
- Provides **offline-first mobile apps** for field workers with auto-sync
- Maintains **tamper-proof records** using blockchain (Sepolia Ethereum)
- Offers **voice-assisted interfaces** in Hindi and regional languages
- Ensures **transparent land registry** with multi-party digital signatures
- Anchors all complaints and land transactions on blockchain to prevent corruption

---

## Key Features

| Feature | Description | User Benefit |
|---------|-------------|--------------|
| **SMS Complaint System** | File complaints using simple keywords (WATER, SAFAI, ROAD) | No smartphone needed, works on basic phones |
| **IVR Voice System** | Automated voice menus in Hindi/regional languages | For illiterate users, press-button navigation |
| **Offline Mobile App** | Field workers can update complaints without internet | Works in low-connectivity rural areas |
| **Citizen Web Portal** | Track complaints, view government schemes, download certificates | Transparency and self-service |
| **Admin Dashboard** | Real-time analytics, complaint assignment, SLA monitoring | Efficient governance, accountability |
| **Blockchain Land Registry** | Immutable land ownership records with multi-sig approvals | Prevents fraud, ensures legal validity |
| **Complaint Anchoring** | All complaints hashed and stored on Ethereum (Sepolia) | Cannot be deleted/modified, audit trail |
| **Voice-Assisted Navigation** | Text-to-speech for forms and schemes | Accessibility for low-literacy users |
| **Multi-Language Support** | Hindi, English + 2-3 regional languages | Inclusivity across India |

---

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────┐
│              SUPER ADMIN                        │
│  (Platform Owner, All Permissions)              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              SYSTEM ADMIN                       │
│  (User Management, Config, Audit Logs)          │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
    ┌────▼───┐ ┌──▼────┐ ┌──▼──────┐
    │  City  │ │ Dept  │ │  Ward   │
    │  Admin │ │ Head  │ │  Admin  │
    └────┬───┘ └───┬───┘ └─────────┘
         │         │
         │    ┌────▼────────┐
         │    │Dept Officer │
         │    └────┬────────┘
         │         │
    ┌────┴─────────┴──────┬─────────┐
    │                     │         │
┌───▼──────┐      ┌───────▼──┐  ┌──▼────────┐
│  Field   │      │   Call   │  │  Citizen  │
│  Worker  │      │  Center  │  │           │
└──────────┘      │  Agent   │  └───────────┘
                  └──────────┘
```

---

### Detailed Role Definitions

| Role | Permissions | Key Responsibilities |
|------|-------------|----------------------|
| **Citizen** | File complaints, track own complaints, view schemes, update profile | End users filing civic complaints |
| **Call Center Agent** | Create complaints on behalf of citizens, search citizens, view queue | Handles IVR calls, registers complaints |
| **Field Worker** | View assigned tasks, update complaint status, capture photos/location, offline access | On-ground staff (sanitation workers, water dept) |
| **Department Officer** | View dept complaints, assign to field workers, update status, generate reports | Ward/block level official (JE, Inspector) |
| **Department Head** | View all dept data, reassign complaints, approve escalations, analytics | HOD of Water/Sanitation/Health dept |
| **Ward Admin** | View ward-level complaints, escalate issues, performance metrics | Elected representative / Ward officer |
| **City Admin** | Cross-department view, SLA monitoring, city-wide analytics | Municipal Commissioner / District Collector |
| **System Admin** | User management, system config, audit logs, integrations, master data | Technical administrator |
| **Super Admin** | All permissions, role management, tenant config (multi-city) | Platform owner |

---

### Permission Matrix

| Permission | Citizen | Field Worker | CC Agent | Dept Officer | Dept Head | City Admin | System Admin |
|------------|:-------:|:------------:|:--------:|:------------:|:---------:|:----------:|:------------:|
| File Complaint | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Complaints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Dept Complaints | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Complaints | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Assign Complaints | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update Status | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Close Complaint | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage Departments | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Land Registry Access | ✅ (own) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve Land Transfer | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Departments & Complaint Categories

### Core Departments

| Department | Complaint Categories | SMS Keywords | IVR Menu | SLA (Priority) |
|------------|---------------------|--------------|----------|----------------|
| **Water Supply** | No water, low pressure, contaminated water, leakage, new connection, billing | `WATER`, `PAANI`, `JALPANI` | Press 1 | P1: 4hrs, P2: 24hrs |
| **Sanitation & Sewage** | Blocked drains, sewage overflow, garbage not collected, open defecation | `SAFAI`, `GARBAGE`, `DRAIN`, `SEWER` | Press 2 | P1: 4hrs, P3: 72hrs |
| **Roads & Footpaths** | Potholes, damaged roads, footpath encroachment, waterlogging | `ROAD`, `POTHOLE`, `SADAK` | Press 3 | P2: 24hrs, P3: 72hrs |
| **Street Lighting** | Non-functional lights, new light request, damaged poles | `LIGHT`, `BIJLI`, `LAMP` | Press 4 | P3: 72hrs |
| **Public Health** | Disease outbreak, mosquito breeding, food adulteration, hospital issues | `HEALTH`, `MOSQUITO`, `HOSPITAL` | Press 5 | P1: 4hrs |
| **Building & Town Planning** | Illegal construction, building permission, encroachment | `BUILDING`, `CONSTRUCTION` | Press 6 | P3: 72hrs |
| **Property Tax** | Tax assessment, billing errors, receipt issues, exemption requests | `TAX`, `PROPERTY` | Press 7 | P4: 7 days |
| **Birth & Death Registration** | Certificate delays, corrections, new registration | `BIRTH`, `DEATH`, `CERTIFICATE` | Press 8 | P4: 7 days |
| **Public Grievance (General)** | Miscellaneous, corruption, staff behavior, delays | `COMPLAINT`, `SHIKAYAT` | Press 9 | P2: 24hrs |

---

### Extended Departments (Optional)

| Department | Complaint Categories |
|------------|---------------------|
| **Electricity** | Power outage, meter issues, billing, theft reporting |
| **Transport & Traffic** | Traffic signals, parking issues, bus service, auto/taxi complaints |
| **Parks & Gardens** | Park maintenance, tree cutting permission, playground issues |
| **Fire Services** | Fire safety inspection, NOC requests, emergency coordination |
| **Animal Control** | Stray dogs, cattle menace, animal cruelty, dead animal removal |
| **Markets & Licensing** | Vendor license, shop registration, market encroachment |
| **Environment** | Air pollution, noise pollution, industrial waste, tree plantation |
| **Social Welfare** | Pension issues, scholarship, disability certificate, BPL card |
| **Education** | School infrastructure, mid-day meal, teacher absence |
| **Housing & Slum** | Slum rehabilitation, housing scheme, eviction issues |

---

## Complaint Priority & SLA Matrix

| Priority | Response Time | Resolution Time | Escalation | Example |
|----------|--------------|-----------------|------------|---------|
| **P1 - Urgent** | 1 hour | 4 hours | Auto-escalate to Dept Head after 2 hours | Sewage overflow, water contamination, disease outbreak |
| **P2 - High** | 4 hours | 24 hours | Escalate to Ward Admin after 12 hours | No water supply, major pothole, streetlight cluster failure |
| **P3 - Normal** | 24 hours | 72 hours | Escalate to Dept Head after 48 hours | Single streetlight, garbage delay, minor leak |
| **P4 - Low** | 48 hours | 7 days | No auto-escalation | New connection request, certificate issuance, information |

---

## SMS/IVR Workflow

### SMS Complaint Registration

```
Citizen sends SMS: "WATER leakage near Sector 5 market"
         │
         ▼
┌─────────────────────────┐
│ Parse SMS Keywords      │
│ Found: "WATER"          │
│ Location: "Sector 5"    │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Match to Department     │
│ → Water Supply Dept     │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Extract Location        │
│ → "Sector 5" → Ward 12  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Assign to Officer       │
│ → Ward 12 JE (Water)    │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Anchor on Blockchain    │
│ → Hash + Queue for batch│
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Send Confirmation SMS   │
│ "Complaint #CS12345     │
│  registered. Track at   │
│  citysamdhaan.gov.in"   │
└─────────────────────────┘
```

---

### IVR Call Flow

```
[Citizen dials toll-free number]
    ↓
"नमस्ते। सिटी समाधान में आपका स्वागत है।"
"Welcome to City Samdhaan."
    ↓
"शिकायत दर्ज करने के लिए 1 दबाएं"
"Press 1 to file a complaint"
    ↓
[User presses 1]
    ↓
"पानी की समस्या के लिए 1 दबाएं"
"Press 1 for water supply issues"
    ↓
[User presses 1]
    ↓
"कृपया अपना इलाका बोलें"
"Please speak your area name"
    ↓
[Speech-to-text captures: "Sector 5"]
    ↓
"आपकी शिकायत दर्ज कर दी गई है। शिकायत संख्या CS12345"
"Your complaint has been registered. Complaint number CS12345"
```

---

## Blockchain Integration Overview

### Purpose

1. **Prevent Corruption**: All complaints and land transactions are immutably recorded
2. **Audit Trail**: Complete history of who did what and when
3. **Transparency**: Citizens can verify their complaint on blockchain explorer
4. **Legal Validity**: Land registry entries with multi-party digital signatures

### What Goes on Blockchain (Sepolia Ethereum)

| Data Type | Storage Method | Frequency |
|-----------|---------------|-----------|
| **Complaint Hash** | Merkle root batch (100 complaints) | Every 100 complaints or 1 hour |
| **Land Registry Entry** | Individual transaction per property | On-demand |
| **Status Updates** | Hash of update details | On every status change |
| **Document Signatures** | Multi-sig approval records | On approval/rejection |
| **Audit Logs** | Hash chain linking all entries | Continuous |

### What Goes on Cloudinary

| Data Type | Format | Access Control |
|-----------|--------|----------------|
| Complaint photos | JPG/PNG (max 5MB) | Public URL with hash verification |
| Land documents (PDFs) | PDF (encrypted) | Access only via authenticated API |
| User profile photos | JPG/PNG (200KB) | Public |
| Voice recordings (IVR) | MP3/WAV | Internal only |
| Government certificates | PDF | Authenticated access |

---

## Land Registry Module (Special Feature)

### Document Types (Indian Context)

| Document | Purpose | Issuing Authority | Blockchain Storage |
|----------|---------|-------------------|-------------------|
| **Sale Deed** | Legal proof of ownership transfer | Sub-Registrar Office | Document hash + signatures |
| **Mutation (Khata Transfer)** | Updates revenue records | Tehsildar Office | Approval workflow hash |
| **Encumbrance Certificate** | Property free from legal dues | Sub-Registrar Office | Certificate hash |
| **Title Deed** | Establishes ownership chain | Historical records | Ownership history chain |
| **Patta/Khata Certificate** | Property tax assessment | Revenue Department | Tax record hash |
| **7/12 Extract** (Maharashtra) | Land ownership & cultivation | Talathi Office | Land details hash |
| **RTC** (Karnataka) | Record of Rights, Tenancy, Crops | Revenue Department | Property metadata hash |

### Multi-Party Approval Workflow

```
Property Transfer Stages (7 steps)
    ↓
1. Agreement Signed (Buyer + Seller)
    ↓
2. Stamp Duty Paid (Verified by System)
    ↓
3. Documents Verified (Surveyor Role)
    ↓
4. Registrar Approved (Sub-Registrar Role)
    ↓
5. Mutation Initiated (Tehsildar Role)
    ↓
6. Field Verification (Revenue Inspector)
    ↓
7. Mutation Completed (Tehsildar Role)
    ↓
[Ownership transferred on blockchain]
```

Each stage requires digital signature from authorized government official.

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite + Tailwind CSS | Citizen portal, admin dashboard |
| **Backend** | Node.js 20 + Express.js | REST APIs, business logic |
| **Database** | MongoDB 7 + Mongoose | Users, complaints, departments, properties |
| **Blockchain** | Solidity 0.8.19 + Ethers.js v6 + Hardhat | Smart contracts on Sepolia |
| **File Storage** | Cloudinary | Photos, PDFs, voice recordings |
| **SMS/Voice** | Twilio / MSG91 | SMS gateway and IVR system |
| **Cache/Queue** | Redis + Bull | Job queues, session management |
| **Auth** | JWT + bcrypt | Token-based authentication |
| **Mobile** | React Native + WatermelonDB | Offline-first mobile app |
| **Real-time** | Socket.io | Live complaint status updates |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **SMS Complaint Registration** | <30 seconds | Time from SMS to confirmation |
| **IVR Call Completion** | >80% | Calls that successfully file complaint |
| **Offline App Sync** | <2 minutes | Time to sync when back online |
| **SLA Compliance** | >85% | Complaints resolved within SLA |
| **Blockchain Anchoring** | <5 minutes | Time from complaint to blockchain |
| **Mobile App Works Offline** | 100% | All features except sync |
| **Multi-language Support** | 3+ languages | Hindi, English, + regional |
| **Land Registry Accuracy** | 100% | Zero fraudulent entries |

---

## Next Steps

1. Review [Technical Architecture](./02-TECHNICAL-ARCHITECTURE.md) for MERN stack implementation details
2. Study [Blockchain Integration](./03-BLOCKCHAIN-INTEGRATION.md) for smart contract design
3. Understand [Land Registry Module](./04-LAND-REGISTRY-MODULE.md) for legal compliance
4. Follow [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md) for week-by-week tasks

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2025  
**Authors**: CitySamdhaan Development Team
