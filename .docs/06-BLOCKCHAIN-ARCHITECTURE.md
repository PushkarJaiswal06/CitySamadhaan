# Blockchain Integration Architecture

## Overview

CitySamdhaan uses a **hybrid architecture** combining blockchain immutability with traditional database performance. This document explains what data is stored on-chain vs off-chain and why.

---

## 🔗 On-Chain Components (Ethereum Sepolia)

### 1. ComplaintRegistry Smart Contract

**Contract Address:** `0x425A70503a1Aacb0c9aDa9B9f2ED199Ffc116ef5`  
**Etherscan:** https://sepolia.etherscan.io/address/0x425A70503a1Aacb0c9aDa9B9f2ED199Ffc116ef5

#### What Gets Stored:

**A. Complaint Registration**
```solidity
struct Complaint {
    bytes32 dataHash;        // SHA256 hash of complaint data
    address citizen;         // Citizen's wallet address
    uint256 timestamp;       // Registration timestamp
    string status;           // Current status
    string department;       // Department code
}
```

**Stored Fields:**
- `complaintId` - Unique identifier (e.g., CSB-2024-001)
- `dataHash` - Cryptographic hash of complaint details
- `citizen` - Ethereum address of complainant
- `department` - Department code (e.g., WATER, ROADS)
- `timestamp` - Unix timestamp of registration
- `status` - Current status (pending, assigned, in_progress, resolved)

**B. Status Updates**
```solidity
struct StatusUpdate {
    string status;           // New status
    bytes32 updateHash;      // Hash of update data
    address updatedBy;       // Officer's address
    uint256 timestamp;       // Update timestamp
    string comment;          // Brief comment
}
```

**Complete History:**
- All status transitions stored in array
- Immutable record of who changed what and when
- Cannot be deleted or modified

#### Key Functions:

1. **registerComplaint()** - Anchor new complaint on-chain
2. **updateStatus()** - Record status change
3. **verifyComplaint()** - Check data integrity
4. **getStatusHistory()** - Retrieve full audit trail
5. **getComplaint()** - Get on-chain complaint data

---

### 2. AuditTrail Smart Contract

**Contract Address:** `0x1ba012De634A47D0a2Cd2dd5A889c449A35aA18B`  
**Etherscan:** https://sepolia.etherscan.io/address/0x1ba012De634A47D0a2Cd2dd5A889c449A35aA18B

#### What Gets Stored:

**Audit Entry Structure:**
```solidity
struct AuditEntry {
    uint256 entryId;         // Sequential ID
    ActionType actionType;   // Type of action
    string entityId;         // Entity identifier
    bytes32 dataHash;        // Hash of action data
    address performedBy;     // Who performed action
    uint256 timestamp;       // When it happened
    string description;      // Brief description
    bytes32 previousHash;    // Link to previous entry
}
```

**Action Types Tracked:**
```solidity
enum ActionType {
    USER_CREATED,           // 0 - New user registered
    USER_UPDATED,           // 1 - User profile modified
    USER_DELETED,           // 2 - User account deleted
    COMPLAINT_CREATED,      // 3 - New complaint filed
    COMPLAINT_UPDATED,      // 4 - Complaint details changed
    COMPLAINT_ASSIGNED,     // 5 - Assigned to field worker
    COMPLAINT_RESOLVED,     // 6 - Marked as resolved
    DEPARTMENT_CREATED,     // 7 - New department added
    ROLE_ASSIGNED,          // 8 - User role changed
    PERMISSION_CHANGED,     // 9 - Permissions modified
    DATA_ACCESSED,          // 10 - Sensitive data viewed
    SYSTEM_CONFIG_CHANGED   // 11 - System settings changed
}
```

#### Chain Integrity:

Each audit entry links to the previous entry via `previousHash`, creating a blockchain-within-blockchain:

```
Entry 1 (hash: 0xabc...)
    ↓
Entry 2 (previousHash: 0xabc..., hash: 0xdef...)
    ↓
Entry 3 (previousHash: 0xdef..., hash: 0x123...)
```

**Benefits:**
- Detects tampering if chain breaks
- Chronological ordering guaranteed
- Cannot insert entries retroactively

#### Key Functions:

1. **recordAudit()** - Log system action
2. **verifyChainIntegrity()** - Validate audit chain
3. **verifyDataIntegrity()** - Check specific entry
4. **getAuditEntry()** - Retrieve audit details
5. **getAuditsByEntity()** - Get all audits for entity

---

## 🗄️ Off-Chain Components (MongoDB)

### What's NOT on Blockchain:

#### 1. Personal Information
- Full names
- Email addresses
- Phone numbers
- Physical addresses
- Profile pictures

**Reason:** Privacy compliance (GDPR), sensitive data protection

#### 2. Complaint Details
- Full descriptions (can be lengthy)
- Ward numbers
- Exact coordinates
- Area names
- Pincode

**Reason:** Storage cost, privacy, performance

#### 3. Media Files
- Images (photos of issues)
- Videos
- Audio recordings
- Documents

**Reason:** Blockchain storage extremely expensive (~$1000 per MB)

#### 4. Comments & Feedback
- Officer comments
- Citizen feedback
- Internal notes
- Chat messages

**Reason:** High volume, frequent updates, not critical for verification

#### 5. Analytics & Aggregations
- Complaint counts
- Department statistics
- Resolution times
- Performance metrics

**Reason:** Computed data, changes frequently, not immutable

#### 6. Session Data
- JWT tokens
- OTP codes
- Login sessions
- Cache data

**Reason:** Temporary data, expires, not audit-worthy

---

## 🔄 Data Flow Architecture

### Complaint Creation Flow:

```
┌─────────────────────────────────────────────────────┐
│ 1. User submits complaint via Web/Mobile           │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 2. Backend validates and saves to MongoDB          │
│    - Full complaint details                         │
│    - Media URLs from Cloudinary                     │
│    - User information                               │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 3. Backend generates SHA256 hash                    │
│    Hash of: {                                       │
│      complaintId, title, description,               │
│      department, category, location, timestamp      │
│    }                                                │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 4. Call ComplaintRegistry.registerComplaint()      │
│    - Send hash + metadata                           │
│    - Wait for transaction confirmation              │
│    - Get transaction hash                           │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 5. Update MongoDB with blockchain data             │
│    - blockchainHash: "0xtxhash..."                  │
│    - blockchainDataHash: "0xdatahash..."            │
│    - blockchain.anchored: true                      │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 6. Record audit entry on AuditTrail                │
│    - ActionType: COMPLAINT_CREATED                  │
│    - EntityId: complaint ID                         │
│    - DataHash: audit data hash                      │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│ 7. Return success to user                          │
│    - Show "Blockchain Verified" badge               │
│    - Display Etherscan link                         │
└─────────────────────────────────────────────────────┘
```

### Status Update Flow:

```
Officer updates status
        ↓
MongoDB: Update complaint status
        ↓
Backend: Generate update hash
        ↓
ComplaintRegistry.updateStatus()
        ↓
AuditTrail.recordAudit(COMPLAINT_UPDATED)
        ↓
MongoDB: Store transaction hash
        ↓
User: Notification + blockchain link
```

### Verification Flow:

```
User clicks "Verify Data Integrity"
        ↓
Backend: Retrieve complaint from MongoDB
        ↓
Backend: Generate current hash
        ↓
ComplaintRegistry.verifyComplaint(hash)
        ↓
Smart contract compares hashes
        ↓
Return: ✅ Verified or ❌ Tampered
```

---

## 📊 Data Distribution

### Storage Breakdown:

| Data Type | Location | Size | Cost |
|-----------|----------|------|------|
| Complaint metadata | Blockchain | 32 bytes hash | ~$0.15 |
| Full complaint | MongoDB | 1-5 KB | Free |
| Images | Cloudinary | 100-500 KB | Free tier |
| Status updates | Blockchain | 32 bytes each | ~$0.08 |
| Comments | MongoDB | Variable | Free |
| Audit entries | Blockchain | ~200 bytes | ~$0.07 |
| User profiles | MongoDB | 2-5 KB | Free |

### Cost Analysis (per 1000 complaints):

**On-Chain (Sepolia testnet - FREE):**
- Register: 1000 × $0.15 = $150
- Updates (3 avg): 3000 × $0.08 = $240
- Audits (5 avg): 5000 × $0.07 = $350
- **Total: ~$740** (mainnet cost, testnet is free)

**Off-Chain (MongoDB Atlas):**
- Storage: ~10 MB
- Operations: Unlimited
- **Cost: $0** (free tier)

---

## 🔐 Security Model

### Blockchain Layer (Immutable):

**What's Protected:**
- Complaint existence proof
- Status change timeline
- Officer accountability
- Data integrity hashes
- System action logs

**Security Features:**
- Cannot delete records
- Cannot modify past entries
- Cryptographically signed
- Publicly verifiable
- Distributed consensus

### Database Layer (Mutable):

**What's Flexible:**
- User profile updates
- Complaint descriptions
- Media attachments
- Comments/feedback
- Analytics data

**Security Features:**
- Authentication required
- Role-based access control
- Audit logging
- Backup & recovery
- Encryption at rest

---

## 🎯 Why This Hybrid Approach?

### Advantages:

1. **Cost Efficiency**
   - Blockchain: Only critical hashes (~$1/complaint)
   - Database: Bulk data storage (free)

2. **Performance**
   - Blockchain: Slow (15-30 sec confirmation)
   - Database: Fast (ms response time)

3. **Privacy**
   - Blockchain: Only hashes (anonymous)
   - Database: Full details (protected)

4. **Scalability**
   - Blockchain: Limited TPS (~15/sec)
   - Database: Unlimited

5. **Flexibility**
   - Blockchain: Immutable (trust)
   - Database: Updatable (usability)

6. **Compliance**
   - Blockchain: Cannot delete (GDPR challenge)
   - Database: Can delete/modify (GDPR compliant)

### Trade-offs Accepted:

❌ **Not stored on blockchain:**
- Personal identifiable information
- Large files/media
- Frequently changing data
- Temporary data

✅ **Stored on blockchain:**
- Proof of existence
- Critical state changes
- Accountability records
- Data integrity hashes

---

## 🔍 Verification Capabilities

### What Users Can Verify:

1. **Complaint Registration**
   - Was it actually registered?
   - When was it registered?
   - Who registered it?

2. **Status Changes**
   - What status changes occurred?
   - When did they happen?
   - Who made the changes?

3. **Data Integrity**
   - Has complaint data been tampered?
   - Hash mismatch = tampering detected

4. **Audit Trail**
   - All system actions logged
   - Chain integrity verifiable
   - Cannot hide actions

### How to Verify:

**Via Frontend:**
1. Open complaint details
2. Click "Verify Data Integrity"
3. See blockchain verification result

**Via Etherscan:**
1. Visit contract address
2. Read contract → getComplaint()
3. Enter complaint ID
4. View on-chain data

**Via API:**
```bash
GET /api/complaints/:id/verify-blockchain
```

---

## 📈 Scalability Considerations

### Current Capacity:

- **Blockchain**: 15 TPS (transactions per second)
- **Database**: 1000+ TPS
- **Combined**: Database handles load, blockchain anchors proofs

### Growth Strategy:

**Phase 1 (Current): Sepolia Testnet**
- Free transactions
- Testing and development
- Proof of concept

**Phase 2: Layer 2 (Polygon/Arbitrum)**
- 100x cheaper than mainnet
- Faster confirmations
- Higher throughput

**Phase 3: Batch Operations**
- Group multiple complaints into one transaction
- Merkle tree for efficient verification
- 10x cost reduction

**Phase 4: Selective Anchoring**
- Only high-priority complaints on-chain
- Others in database with periodic batch anchoring
- Balance cost vs trust

---

## 🛠️ Integration Points

### Backend Integration:

**File:** `backend/services/blockchainService.js`

**Methods:**
```javascript
// Register complaint on blockchain
await blockchainService.registerComplaint(complaintData);

// Update complaint status
await blockchainService.updateComplaintStatus(id, statusData);

// Verify complaint integrity
await blockchainService.verifyComplaint(id, complaintData);

// Record audit entry
await blockchainService.recordAudit(auditData);

// Get blockchain stats
await blockchainService.getBlockchainStats();
```

### Database Schema:

**Complaint Model Extensions:**
```javascript
{
  // ... other fields ...
  
  // Blockchain fields
  blockchainHash: String,          // Transaction hash
  blockchainDataHash: String,      // Data hash used
  blockchain: {
    anchored: Boolean,             // Is on-chain?
    transactionHash: String,       // TX hash
    blockNumber: Number,           // Block number
    anchoredAt: Date,             // When anchored
    dataHash: String,             // Data hash
    verified: Boolean             // Last verification result
  }
}
```

### Frontend Integration:

**Component:** `frontend/src/components/BlockchainVerification.jsx`

**Features:**
- Blockchain verified badge
- Transaction hash display
- Etherscan link button
- Verify data integrity button
- Verification result UI

---

## 📝 Summary

### On Blockchain (Immutable Proof Layer):
✅ Complaint hashes  
✅ Status transitions  
✅ Officer actions  
✅ System audits  
✅ Timestamps  

### In Database (Operational Data Layer):
✅ Full complaint details  
✅ Personal information  
✅ Media files  
✅ Comments & feedback  
✅ Analytics  

### Result:
🎯 **Best of both worlds** - Immutable transparency + Efficient operations

---

## 🔗 Live Contracts

**Sepolia Testnet:**
- ComplaintRegistry: `0x425A70503a1Aacb0c9aDa9B9f2ED199Ffc116ef5`
- AuditTrail: `0x1ba012De634A47D0a2Cd2dd5A889c449A35aA18B`
- Network: Sepolia
- Explorer: https://sepolia.etherscan.io/

**Deployed By:**
- Address: `0xD5b76994c04105ba70b7a4eF1FFa2866b911a4E8`
- Balance: 0.05 ETH (testnet)

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready
