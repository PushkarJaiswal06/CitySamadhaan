# CitySamdhaan - Land Registry Module

## Overview

The Land Registry Module is a blockchain-enabled system for managing property ownership records in India. It digitizes the traditional land registration process while maintaining legal validity through multi-party digital signatures and immutable blockchain records.

---

## Legal Context (India)

### Land Registration Laws

| Act/Rule | Applicability | Key Provisions |
|----------|---------------|----------------|
| **Registration Act, 1908** | All India | Mandatory registration of sale deeds, transfers |
| **Transfer of Property Act, 1882** | All India | Defines transfer of immovable property |
| **Indian Evidence Act, 1872** | All India | Admissibility of electronic records |
| **IT Act, 2000 (Section 3)** | All India | Digital signatures have legal validity |
| **State Revenue Acts** | State-specific | Mutation, land records, survey numbers |

### Digital Signature Validity

**IT Act 2000, Section 3**: Digital signatures created through asymmetric crypto are legally valid and admissible in court, provided:
1. Signer has exclusive control of private key
2. Signature is linked uniquely to the signer
3. Any alteration to signed document is detectable

**This enables blockchain-based land registry** where government officials' Ethereum private keys serve as digital signatures.

---

## Document Types & Flow

### Primary Land Documents (India)

| Document | Issuing Authority | Purpose | Validity | Blockchain Storage |
|----------|-------------------|---------|----------|-------------------|
| **Sale Deed** | Sub-Registrar | Legal proof of property sale | Lifetime | Document hash + signatures |
| **Mutation Entry (Khata Transfer)** | Tehsildar/Revenue Officer | Updates government records | Lifetime | Mutation approval hash |
| **Encumbrance Certificate (EC)** | Sub-Registrar | Proves no legal/financial dues | Valid for period | Certificate hash |
| **Title Deed** | N/A (Historical chain) | Establishes ownership chain | Lifetime | Complete ownership history |
| **7/12 Extract** (Maharashtra) | Talathi Office | Land ownership & cultivation | Current | Property metadata hash |
| **RTC (Record of Rights, Tenancy, Crops)** (Karnataka) | Revenue Department | Land ownership details | Current | Property metadata hash |
| **Patta/Khata Certificate** | Revenue Department | Property tax assessment | Annual | Tax record hash |
| **Survey Map** | Survey Department | Property boundaries | Permanent | GeoJSON hash |

---

### Traditional vs Blockchain Flow

#### Traditional Process (Current)

```
┌────────────────────────┐
│ Buyer & Seller Agree   │
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ Visit Sub-Registrar    │  ← Physical presence required
│ Office with Witnesses  │     Aadhaar verification
└───────────┬────────────┘     Biometric authentication
            ▼
┌────────────────────────┐
│ Pay Stamp Duty         │  ← Online/offline payment
│ (e-Stamping Portal)    │     7-10% of property value
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ Document Registration  │  ← Sub-Registrar signs
│ (Sale Deed)            │     Physical stamp
└───────────┬────────────┘     Paper + digital copy
            ▼
┌────────────────────────┐
│ Apply for Mutation     │  ← Submit to Tehsildar
│                        │     10-30 days wait
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ Field Verification     │  ← Revenue Inspector visits
│                        │     Measures boundaries
└───────────┬────────────┘     Checks encroachment
            ▼
┌────────────────────────┐
│ Mutation Approval      │  ← Tehsildar signs
│                        │     Updates 7/12 Extract
└───────────┬────────────┘     Issues new RTC
            ▼
┌────────────────────────┐
│ Updated Land Records   │  ← 30-90 days total
│ (Buyer is now owner)   │     No cryptographic proof
└────────────────────────┘     Prone to tampering
```

**Problems**:
- 30-90 days process time
- Multiple physical visits
- Manual record updates prone to errors
- No tamper-proof audit trail
- Corruption opportunities at each stage

---

#### Blockchain-Enabled Process (CitySamdhaan)

```
┌────────────────────────┐
│ Buyer & Seller Agree   │
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ Upload to CitySamdhaan │  ← Digital upload
│ Portal with KYC        │     Aadhaar verification
└───────────┬────────────┘     MetaMask wallet link
            ▼
┌────────────────────────┐
│ Pay Stamp Duty         │  ← Integrated payment
│ (Auto-calculated)      │     Instant receipt
└───────────┬────────────┘     Hash anchored on blockchain
            ▼
┌────────────────────────┐
│ Document Verification  │  ← AI-powered document check
│                        │     Hash stored on Cloudinary
└───────────┬────────────┘     Blockchain anchor
            ▼
┌────────────────────────┐
│ Multi-Party Approval   │  ← Sub-Registrar digital sign
│ Workflow               │     Surveyor digital sign
└───────────┬────────────┘     Tehsildar digital sign
            ▼                  Each signature on blockchain
┌────────────────────────┐
│ Smart Contract         │  ← LandRegistry.sol
│ Executes Transfer      │     Ownership updated on-chain
└───────────┬────────────┘     Immutable record
            ▼
┌────────────────────────┐
│ Mutation Auto-Updated  │  ← MongoDB + Blockchain
│                        │     Real-time update
└───────────┬────────────┘     7/12 Extract regenerated
            ▼
┌────────────────────────┐
│ Blockchain Proof       │  ← 5-7 days total
│ Available to Citizen   │     Zero corruption
└────────────────────────┘     Cryptographically verifiable
```

**Benefits**:
- 80% faster (5-7 days vs 30-90 days)
- Zero physical visits (except final registration if required by law)
- Immutable audit trail on blockchain
- Multi-party digital signatures
- Citizen can verify on Etherscan
- No scope for tampering or corruption

---

## Property Registration Flow

### Stage 1: Initial Registration

```javascript
// Citizen initiates property registration
POST /api/v1/land/properties
{
  "surveyNumber": "123/4A",
  "location": {
    "state": "Maharashtra",
    "district": "Mumbai",
    "taluk": "Andheri",
    "village": "Versova"
  },
  "area": {
    "value": 1000,
    "unit": "sq_meters"
  },
  "propertyType": "residential",
  "documents": [
    {
      "type": "title_deed",
      "file": "<PDF uploaded to Cloudinary>"
    },
    {
      "type": "survey_map",
      "file": "<GeoJSON uploaded to Cloudinary>"
    }
  ]
}
```

**Backend Process**:
1. Upload documents to Cloudinary (encrypted PDFs)
2. Generate SHA-256 hash of each document
3. Create property record in MongoDB
4. Call `LandRegistry.registerProperty()` smart contract
5. Store blockchain transaction hash
6. Send confirmation SMS/email to citizen

---

### Stage 2: Property Transfer Initiation

```javascript
// Current owner initiates transfer
POST /api/v1/land/transfers
{
  "propertyId": "PROP-MH-MUM-001",
  "buyerId": "<ObjectId of buyer user>",
  "saleAmount": 5000000,
  "documents": [
    {
      "type": "sale_agreement",
      "file": "<PDF>"
    },
    {
      "type": "identity_proof_seller",
      "file": "<PDF>"
    },
    {
      "type": "identity_proof_buyer",
      "file": "<PDF>"
    }
  ]
}
```

**Backend Process**:
1. Verify caller is current owner
2. Verify buyer exists and has wallet address
3. Upload documents to Cloudinary
4. Hash documents
5. Call `LandRegistry.initiateTransfer()` smart contract
6. Create transfer record in MongoDB with status "initiated"
7. Notify buyer, Sub-Registrar, Tehsildar

---

### Stage 3: Multi-Party Approval Workflow

#### Workflow Stages

| Stage | Approver Role | Actions | Timeline | Blockchain Tx |
|-------|--------------|---------|----------|---------------|
| 1. Agreement Signed | Seller + Buyer | Upload signed sale agreement | Day 1 | Transfer initiated |
| 2. Stamp Duty Paid | Buyer | Pay stamp duty online | Day 1-2 | Payment receipt hash |
| 3. Documents Verified | Surveyor | Verify documents, survey map | Day 2-3 | Digital signature |
| 4. Registrar Approved | Sub-Registrar | Approve registration | Day 3-4 | Digital signature |
| 5. Mutation Initiated | Tehsildar | Start mutation process | Day 4 | Digital signature |
| 6. Field Verification | Revenue Inspector | Verify property physically | Day 4-6 | GPS coordinates + photo hash |
| 7. Mutation Completed | Tehsildar | Approve mutation | Day 6-7 | Transfer completed on-chain |

---

#### Stage Approval API

```javascript
// Government official approves stage
POST /api/v1/land/transfers/:transferId/approve
{
  "newStage": "documents_verified",
  "supportingDocuments": [
    {
      "type": "surveyor_report",
      "file": "<PDF>"
    }
  ],
  "remarks": "All documents verified. Property boundaries match survey map.",
  "signature": "<MetaMask signature>"
}
```

**Backend Process**:
1. Verify caller has required role (RBAC middleware)
2. Verify signature using Web3
3. Upload supporting documents
4. Call `LandRegistry.approveTransferStage()` smart contract
5. Update MongoDB transfer record
6. Log in AuditLogger.sol
7. Notify next approver in workflow
8. Send SMS to buyer/seller with progress update

---

## Smart Contract Workflow

### LandRegistry.sol Transfer Stages

```solidity
enum TransferStage {
    None,
    AgreementSigned,        // Stage 1: Seller initiates
    StampDutyPaid,          // Stage 2: Buyer pays
    DocumentsVerified,      // Stage 3: Surveyor approves
    RegistrarApproved,      // Stage 4: Sub-Registrar approves
    MutationInitiated,      // Stage 5: Tehsildar initiates
    FieldVerificationComplete, // Stage 6: Inspector verifies
    MutationCompleted       // Stage 7: Transfer complete
}

// Each stage requires specific role
function approveTransferStage(
    bytes32 transferId,
    TransferStage newStage,
    bytes32 supportingDocHash
) external {
    // Role-based validation
    if (newStage == TransferStage.DocumentsVerified) {
        require(hasRole(SURVEYOR_ROLE, msg.sender), "Not surveyor");
    } else if (newStage == TransferStage.RegistrarApproved) {
        require(hasRole(REGISTRAR_ROLE, msg.sender), "Not registrar");
    } else if (newStage == TransferStage.MutationCompleted) {
        require(hasRole(TEHSILDAR_ROLE, msg.sender), "Not tehsildar");
    }
    
    // Update stage
    transfer.currentStage = newStage;
    
    // Record approval
    transfer.approvals[keccak256(abi.encodePacked(msg.sender, newStage))] = true;
    
    // If final stage, complete transfer
    if (newStage == TransferStage.MutationCompleted) {
        _completeTransfer(transferId);
    }
}
```

---

## Document Verification & Anti-Fraud

### Document Hashing Strategy

```javascript
// backend/src/services/documentService.js
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

class DocumentService {
  
  /**
   * Upload document to Cloudinary and generate hash
   */
  async uploadAndHash(file, propertyId, documentType) {
    // Upload to Cloudinary with encryption
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `land/documents/${propertyId}`,
      resource_type: 'raw',
      type: 'private', // Encrypted storage
      format: 'pdf'
    });
    
    // Generate SHA-256 hash
    const fileBuffer = await fs.readFile(file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      hash: `0x${hash}`,
      size: result.bytes,
      uploadedAt: new Date()
    };
  }
  
  /**
   * Verify document hasn't been tampered
   */
  async verifyDocument(propertyId, documentHash) {
    // Check in MongoDB
    const property = await Property.findOne({ propertyId });
    const document = property.documents.find(d => d.hash === documentHash);
    
    if (!document) {
      return { verified: false, reason: 'Document not found' };
    }
    
    // Verify on blockchain
    const isOnChain = await landRegistryContract.verifyDocument(
      property.blockchainPropertyId,
      documentHash
    );
    
    if (!isOnChain) {
      return { verified: false, reason: 'Not anchored on blockchain' };
    }
    
    // Download from Cloudinary and re-hash
    const response = await axios.get(document.url, { responseType: 'arraybuffer' });
    const currentHash = crypto.createHash('sha256').update(response.data).digest('hex');
    const expectedHash = documentHash.slice(2); // Remove 0x
    
    if (currentHash !== expectedHash) {
      return { 
        verified: false, 
        reason: 'Document has been tampered',
        originalHash: documentHash,
        currentHash: `0x${currentHash}`
      };
    }
    
    return {
      verified: true,
      documentType: document.type,
      uploadedAt: document.uploadedAt,
      blockchainVerified: true
    };
  }
}
```

---

### Multi-Signature Verification

```javascript
// backend/src/services/signatureService.js
const { ethers } = require('ethers');

class SignatureService {
  
  /**
   * Verify government official's digital signature
   */
  async verifyOfficialSignature(transferId, stage, signature, officialAddress) {
    try {
      // Message to be signed
      const message = ethers.solidityPackedKeccak256(
        ['bytes32', 'uint8'],
        [transferId, stage]
      );
      
      // Recover signer address from signature
      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(message),
        signature
      );
      
      // Verify recovered address matches official's address
      if (recoveredAddress.toLowerCase() !== officialAddress.toLowerCase()) {
        return { 
          valid: false, 
          reason: 'Signature does not match official address' 
        };
      }
      
      // Verify official has required role
      const user = await User.findOne({ walletAddress: officialAddress });
      
      const roleMap = {
        'documents_verified': 'Surveyor',
        'registrar_approved': 'Sub-Registrar',
        'mutation_completed': 'Tehsildar'
      };
      
      const requiredRole = roleMap[stage];
      if (user.role.name !== requiredRole) {
        return {
          valid: false,
          reason: `Official does not have ${requiredRole} role`
        };
      }
      
      return {
        valid: true,
        officialName: user.name,
        officialRole: user.role.name,
        signedAt: new Date()
      };
      
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
  
  /**
   * Verify all required signatures for transfer
   */
  async verifyAllSignatures(transferId) {
    const transfer = await LandTransfer.findOne({ transferId })
      .populate('approvals.user');
    
    const requiredRoles = [
      'Surveyor',
      'Sub-Registrar',
      'Tehsildar'
    ];
    
    const receivedRoles = transfer.approvals
      .filter(a => a.approved)
      .map(a => a.user.role.name);
    
    const missingRoles = requiredRoles.filter(r => !receivedRoles.includes(r));
    
    if (missingRoles.length > 0) {
      return {
        allSigned: false,
        missingRoles: missingRoles
      };
    }
    
    return {
      allSigned: true,
      approvals: transfer.approvals
    };
  }
}
```

---

## Aadhaar Integration

### Zero-Knowledge Proof for Aadhaar

**Problem**: Cannot store actual Aadhaar numbers (privacy violation under Aadhaar Act)

**Solution**: Store only cryptographic hash

```javascript
// backend/src/services/aadhaarService.js
const crypto = require('crypto');
const axios = require('axios');

class AadhaarService {
  
  /**
   * Generate Aadhaar hash (never store actual number)
   */
  hashAadhaar(aadhaarNumber, salt = process.env.AADHAAR_SALT) {
    return crypto
      .createHash('sha256')
      .update(aadhaarNumber + salt)
      .digest('hex');
  }
  
  /**
   * Verify Aadhaar via UIDAI API (mock - requires government partnership)
   */
  async verifyAadhaar(aadhaarNumber, phone) {
    try {
      // In production, call actual UIDAI API
      // For now, mock verification
      
      // Step 1: Send OTP to Aadhaar-linked phone
      const otpResponse = await axios.post('https://api.uidai.gov.in/otp/send', {
        aadhaar: aadhaarNumber,
        // ... other params
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.UIDAI_API_KEY}`
        }
      });
      
      return {
        success: true,
        txnId: otpResponse.data.txnId,
        message: 'OTP sent to Aadhaar-linked mobile'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verify OTP and link to user account
   */
  async verifyOtpAndLink(txnId, otp, userId) {
    try {
      // Verify OTP with UIDAI
      const response = await axios.post('https://api.uidai.gov.in/otp/verify', {
        txnId: txnId,
        otp: otp
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.UIDAI_API_KEY}`
        }
      });
      
      // Get demographic data (name, DOB, address)
      const demographics = response.data.demographics;
      
      // Hash Aadhaar
      const aadhaarHash = this.hashAadhaar(response.data.aadhaar);
      
      // Update user
      const user = await User.findByIdAndUpdate(userId, {
        aadhaarHash: aadhaarHash,
        name: demographics.name,
        // ... other verified fields
        aadhaarVerified: true
      });
      
      // Store verification on blockchain
      const verificationProof = crypto.createHash('sha256')
        .update(JSON.stringify(demographics))
        .digest('hex');
      
      await aadhaarVerificationContract.linkAadhaar(
        user.walletAddress,
        `0x${aadhaarHash}`,
        `0x${crypto.createHash('sha256').update(JSON.stringify(demographics)).digest('hex')}`,
        `0x${verificationProof}`
      );
      
      return {
        success: true,
        verified: true
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

---

### DigiLocker Integration

**DigiLocker** is government service to store/retrieve digital documents (driving license, property docs, etc.)

```javascript
// backend/src/services/digilockerService.js
const axios = require('axios');
const crypto = require('crypto');

class DigiLockerService {
  
  /**
   * Fetch property documents from DigiLocker
   */
  async fetchPropertyDocuments(userId, aadhaarHash) {
    try {
      // Step 1: OAuth flow to get user consent
      const authUrl = `https://digilocker.gov.in/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${process.env.DIGILOCKER_CLIENT_ID}&` +
        `redirect_uri=${process.env.DIGILOCKER_REDIRECT_URI}`;
      
      // (User completes OAuth in browser)
      
      // Step 2: Exchange code for access token
      const tokenResponse = await axios.post('https://digilocker.gov.in/oauth2/token', {
        code: '<auth_code>',
        grant_type: 'authorization_code',
        client_id: process.env.DIGILOCKER_CLIENT_ID,
        client_secret: process.env.DIGILOCKER_CLIENT_SECRET
      });
      
      const accessToken = tokenResponse.data.access_token;
      
      // Step 3: Fetch issued documents
      const docsResponse = await axios.get('https://digilocker.gov.in/api/1.0/documents/issued', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Step 4: Filter property-related documents
      const propertyDocs = docsResponse.data.items.filter(doc => 
        doc.type === 'PRPREG' || // Property Registration
        doc.type === 'SALDED'    // Sale Deed
      );
      
      // Step 5: Download and hash each document
      const documents = [];
      for (const doc of propertyDocs) {
        const pdfResponse = await axios.get(doc.uri, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
          responseType: 'arraybuffer'
        });
        
        const hash = crypto.createHash('sha256').update(pdfResponse.data).digest('hex');
        
        // Upload to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload_stream({
          folder: `land/digilocker/${userId}`,
          resource_type: 'raw'
        }, (error, result) => result);
        
        documents.push({
          type: doc.type,
          name: doc.name,
          issuer: doc.issuer,
          url: cloudinaryResult.secure_url,
          hash: `0x${hash}`,
          digilockerUri: doc.uri
        });
      }
      
      return {
        success: true,
        documents: documents
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

---

## Fraud Prevention Mechanisms

### 1. Double Registration Prevention

```javascript
// Before registering property, check if already exists
async function checkDuplicateProperty(surveyNumber, district, taluk, village) {
  // Check in MongoDB
  const existing = await Property.findOne({
    'surveyNumber': surveyNumber,
    'location.district': district,
    'location.taluk': taluk,
    'location.village': village
  });
  
  if (existing) {
    return {
      duplicate: true,
      existingPropertyId: existing.propertyId,
      currentOwner: existing.currentOwner
    };
  }
  
  // Check on blockchain
  const propertyId = ethers.keccak256(ethers.toUtf8Bytes(
    surveyNumber + district + taluk + village
  ));
  
  const blockchainProperty = await landRegistryContract.properties(propertyId);
  
  if (blockchainProperty.registrationTimestamp > 0) {
    return {
      duplicate: true,
      blockchainPropertyId: propertyId,
      blockchainOwner: blockchainProperty.currentOwner
    };
  }
  
  return { duplicate: false };
}
```

---

### 2. Ownership Verification

```javascript
// Verify caller is actual owner before allowing transfer
async function verifyOwnership(propertyId, userId) {
  // Check MongoDB
  const property = await Property.findOne({ propertyId }).populate('currentOwner');
  
  if (property.currentOwner._id.toString() !== userId) {
    return { 
      verified: false, 
      reason: 'User is not the current owner' 
    };
  }
  
  // Check blockchain
  const user = await User.findById(userId);
  const blockchainProperty = await landRegistryContract.properties(property.blockchainPropertyId);
  
  if (blockchainProperty.currentOwner.toLowerCase() !== user.walletAddress.toLowerCase()) {
    return {
      verified: false,
      reason: 'Blockchain ownership mismatch',
      blockchainOwner: blockchainProperty.currentOwner,
      userWallet: user.walletAddress
    };
  }
  
  return { verified: true };
}
```

---

### 3. Document Tampering Detection

```javascript
// Detect if document was modified after upload
async function detectTampering(documentId) {
  const document = await PropertyDocument.findById(documentId);
  
  // Download current version from Cloudinary
  const response = await axios.get(document.url, { responseType: 'arraybuffer' });
  const currentHash = crypto.createHash('sha256').update(response.data).digest('hex');
  
  // Compare with stored hash
  if (`0x${currentHash}` !== document.hash) {
    // TAMPERING DETECTED!
    await AuditLog.create({
      entityType: 'document',
      entityId: documentId,
      action: 'tampering_detected',
      changes: {
        originalHash: document.hash,
        currentHash: `0x${currentHash}`,
        documentUrl: document.url
      },
      timestamp: new Date()
    });
    
    // Alert system admin
    await sendAlert({
      type: 'security',
      severity: 'critical',
      message: `Document tampering detected for ${documentId}`,
      data: { originalHash: document.hash, currentHash: `0x${currentHash}` }
    });
    
    return {
      tampered: true,
      originalHash: document.hash,
      currentHash: `0x${currentHash}`
    };
  }
  
  return { tampered: false };
}
```

---

### 4. Role Escalation Prevention

```javascript
// Prevent unauthorized role changes
async function preventRoleEscalation(userId, newRoleId, requesterId) {
  const requester = await User.findById(requesterId).populate('role');
  const newRole = await Role.findById(newRoleId);
  
  // Only System Admin can change roles
  if (requester.role.slug !== 'system_admin') {
    return {
      allowed: false,
      reason: 'Only System Admin can change user roles'
    };
  }
  
  // Cannot assign role higher than own level
  if (newRole.level >= requester.role.level) {
    return {
      allowed: false,
      reason: 'Cannot assign role equal or higher than own'
    };
  }
  
  // Log on blockchain audit
  const auditHash = crypto.createHash('sha256').update(JSON.stringify({
    userId: userId,
    oldRole: user.role.toString(),
    newRole: newRoleId,
    changedBy: requesterId,
    timestamp: new Date()
  })).digest('hex');
  
  await auditLoggerContract.log(
    2, // ACTION_UPDATE
    ethers.keccak256(ethers.toUtf8Bytes(userId)),
    `0x${auditHash}`
  );
  
  return { allowed: true };
}
```

---

## Citizen Verification Portal

### How Citizens Verify Property on Blockchain

```javascript
// Frontend: Verify Property Page
// /verify-property

import { useState } from 'react';
import { ethers } from 'ethers';

function VerifyProperty() {
  const [propertyId, setPropertyId] = useState('');
  const [verification, setVerification] = useState(null);
  
  const verifyOnBlockchain = async () => {
    try {
      // Get property from backend
      const response = await axios.get(`/api/v1/land/properties/${propertyId}`);
      const property = response.data;
      
      // Connect to Sepolia
      const provider = new ethers.JsonRpcProvider(process.env.VITE_SEPOLIA_RPC_URL);
      const contract = new ethers.Contract(
        process.env.VITE_LAND_REGISTRY_CONTRACT,
        LandRegistryABI,
        provider
      );
      
      // Verify on blockchain
      const blockchainProperty = await contract.properties(property.blockchainPropertyId);
      
      setVerification({
        verified: true,
        propertyId: property.propertyId,
        surveyNumber: property.surveyNumber,
        currentOwner: blockchainProperty.currentOwner,
        registeredOn: new Date(Number(blockchainProperty.registrationTimestamp) * 1000),
        lastTransfer: new Date(Number(blockchainProperty.lastTransferTimestamp) * 1000),
        blockchainTxHash: property.blockchainTxHash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${property.blockchainTxHash}`
      });
      
    } catch (error) {
      setVerification({ verified: false, error: error.message });
    }
  };
  
  return (
    <div>
      <input 
        value={propertyId} 
        onChange={(e) => setPropertyId(e.target.value)}
        placeholder="Enter Property ID (e.g., PROP-MH-MUM-001)"
      />
      <button onClick={verifyOnBlockchain}>Verify on Blockchain</button>
      
      {verification && verification.verified && (
        <div className="verification-result">
          <h3>✅ Property Verified on Blockchain</h3>
          <p><strong>Survey Number:</strong> {verification.surveyNumber}</p>
          <p><strong>Current Owner:</strong> {verification.currentOwner}</p>
          <p><strong>Registered On:</strong> {verification.registeredOn.toLocaleDateString()}</p>
          <p><strong>Last Transfer:</strong> {verification.lastTransfer.toLocaleDateString()}</p>
          <a href={verification.etherscanUrl} target="_blank">
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## Legal Compliance Checklist

| Requirement | Compliance Measure | Status |
|-------------|-------------------|--------|
| **Registration Act, 1908** | Digital signatures from Sub-Registrar (IT Act 2000) | ✅ Compliant |
| **Aadhaar Privacy** | Store only hash, never actual number | ✅ Compliant |
| **IT Act 2000 Section 3** | Ethereum private keys as digital signatures | ✅ Compliant |
| **Evidence Act 1872** | Blockchain records admissible as evidence | ✅ Compliant |
| **State Revenue Acts** | Integration with existing mutation process | ✅ Compliant |
| **Stamp Duty Payment** | Integration with e-Stamping portals | ⚠️ Requires govt partnership |
| **Physical Registration** | Can be retained if required by state law | ⚠️ State-dependent |

---

## Security Audit Trail

Every action logged on blockchain via AuditLogger.sol:

| Action | Logged Data | Blockchain Hash |
|--------|-------------|-----------------|
| Property registration | Survey number, owner, registrar | ✅ |
| Document upload | Document hash, uploader, timestamp | ✅ |
| Transfer initiation | Property ID, seller, buyer, amount | ✅ |
| Stage approval | Stage, approver role, signature | ✅ |
| Ownership transfer | Old owner, new owner, deed hash | ✅ |
| Role change | User, old role, new role, admin | ✅ |

---

## Next Steps

1. Review [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md) for implementation timeline
2. Study blockchain contracts in `blockchain/contracts/`
3. Test land registry flow in development environment

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2025  
**Authors**: CitySamdhaan Development Team
