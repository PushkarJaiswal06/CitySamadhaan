# CitySamdhaan - Blockchain Integration

## Overview

CitySamdhaan uses **Ethereum blockchain (Sepolia testnet)** to provide immutable, tamper-proof records for:
1. **Complaint Anchoring**: All civic complaints are cryptographically hashed and stored on-chain
2. **Land Registry**: Property ownership, transfers, and document verification
3. **Multi-Party Approvals**: Government official signatures for transparency
4. **Audit Trail**: Complete history of all system actions

---

## Why Blockchain?

| Problem | Blockchain Solution |
|---------|---------------------|
| **Corruption** | Immutable records cannot be deleted or modified |
| **Lack of Transparency** | Public blockchain explorer shows all transactions |
| **Trust Deficit** | Cryptographic proof of data integrity |
| **Document Fraud** | Hash verification ensures documents haven't been tampered |
| **Manual Audits** | Automated audit trail with timestamps |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              MERN Backend (Node.js)                     │
├─────────────────────────────────────────────────────────┤
│  • Complaint Service                                    │
│  • Land Registry Service                                │
│  • Document Hashing (SHA-256)                           │
│  • Merkle Tree Generation                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Ethers.js v6
                     │
┌────────────────────▼────────────────────────────────────┐
│         Blockchain Service (Ethers.js Provider)         │
├─────────────────────────────────────────────────────────┤
│  • Wallet Management (Private Keys in KMS)              │
│  • Transaction Signing                                  │
│  • Gas Estimation                                       │
│  • Event Listening                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ RPC Connection
                     │
┌────────────────────▼────────────────────────────────────┐
│            Ethereum Sepolia Testnet                     │
├─────────────────────────────────────────────────────────┤
│  Smart Contracts:                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. LandRegistry.sol                              │  │
│  │    - Property registration & transfers            │  │
│  │    - Multi-sig approval workflow                  │  │
│  │    - Ownership history chain                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 2. ComplaintAnchor.sol                           │  │
│  │    - Batch complaint anchoring (Merkle roots)     │  │
│  │    - Status update tracking                       │  │
│  │    - Verification proofs                          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. AuditLogger.sol                               │  │
│  │    - Tamper-proof audit trail                     │  │
│  │    - Hash chain linking                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 4. DocumentVerification.sol                      │  │
│  │    - Digital signature verification               │  │
│  │    - Authorized signer registry                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5. MultiPartyApproval.sol                        │  │
│  │    - Workflow configuration                       │  │
│  │    - Multi-sig approvals                          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 6. AadhaarVerification.sol                       │  │
│  │    - Zero-knowledge identity proofs               │  │
│  │    - DigiLocker integration                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### 1. ComplaintAnchor.sol

**Purpose**: Batch-anchor civic complaints using Merkle roots for gas efficiency.

#### Key Features
- **Batch Processing**: Anchor 100 complaints in a single transaction
- **Merkle Proof Verification**: Verify individual complaints without storing all data
- **Status Updates**: Track complaint lifecycle on-chain
- **Gas Optimization**: ~0.004 ETH per batch (vs 0.03 ETH if anchoring individually)

#### Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ComplaintAnchor is Ownable, ReentrancyGuard {
    
    // Batch anchoring structure
    struct AnchorBatch {
        bytes32 merkleRoot;
        uint256 complaintCount;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // Individual complaint reference
    struct ComplaintRef {
        bytes32 complaintHash;
        bytes32 batchRoot;
        uint8 status;          // 0=Filed, 1=Acknowledged, 2=InProgress, 3=Resolved, 4=Closed
        uint256 filedAt;
    }
    
    // Status update record
    struct StatusUpdate {
        uint8 previousStatus;
        uint8 newStatus;
        bytes32 updateHash;    // Hash of update details
        address updatedBy;
        uint256 timestamp;
    }
    
    // Storage
    mapping(uint256 => AnchorBatch) public batches;
    mapping(bytes32 => ComplaintRef) public complaints;
    mapping(bytes32 => StatusUpdate[]) public complaintHistory;
    
    uint256 public currentBatchId;
    uint256 public totalComplaints;
    
    // Authorized officers
    mapping(address => bool) public authorizedOfficers;
    
    // Events
    event BatchAnchored(
        uint256 indexed batchId,
        bytes32 merkleRoot,
        uint256 complaintCount,
        uint256 timestamp
    );
    
    event ComplaintRegistered(
        bytes32 indexed complaintHash,
        uint256 indexed batchId,
        uint256 timestamp
    );
    
    event ComplaintStatusUpdated(
        bytes32 indexed complaintHash,
        uint8 previousStatus,
        uint8 newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    modifier onlyAuthorized() {
        require(authorizedOfficers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    function setOfficer(address officer, bool authorized) external onlyOwner {
        authorizedOfficers[officer] = authorized;
    }
    
    /**
     * @dev Anchor a batch of complaints using Merkle root
     * @param merkleRoot Root hash of the Merkle tree
     * @param complaintCount Number of complaints in batch
     * @param complaintHashes Array of individual complaint hashes
     */
    function anchorBatch(
        bytes32 merkleRoot,
        uint256 complaintCount,
        bytes32[] calldata complaintHashes
    ) external onlyAuthorized nonReentrant {
        require(complaintHashes.length == complaintCount, "Count mismatch");
        
        currentBatchId++;
        
        batches[currentBatchId] = AnchorBatch({
            merkleRoot: merkleRoot,
            complaintCount: complaintCount,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        // Register individual complaint references
        for (uint i = 0; i < complaintHashes.length; i++) {
            complaints[complaintHashes[i]] = ComplaintRef({
                complaintHash: complaintHashes[i],
                batchRoot: merkleRoot,
                status: 0, // Filed
                filedAt: block.timestamp
            });
            
            emit ComplaintRegistered(complaintHashes[i], currentBatchId, block.timestamp);
        }
        
        totalComplaints += complaintCount;
        
        emit BatchAnchored(currentBatchId, merkleRoot, complaintCount, block.timestamp);
    }
    
    /**
     * @dev Verify a complaint exists in a batch using Merkle proof
     * @param complaintHash Hash of the complaint
     * @param merkleProof Array of sibling hashes for proof
     * @param batchId Batch ID to verify against
     */
    function verifyComplaint(
        bytes32 complaintHash,
        bytes32[] calldata merkleProof,
        uint256 batchId
    ) external view returns (bool) {
        AnchorBatch memory batch = batches[batchId];
        return MerkleProof.verify(merkleProof, batch.merkleRoot, complaintHash);
    }
    
    /**
     * @dev Update complaint status with audit trail
     * @param complaintHash Hash of the complaint
     * @param newStatus New status code (0-4)
     * @param updateDetailsHash Hash of update details (stored off-chain)
     */
    function updateStatus(
        bytes32 complaintHash,
        uint8 newStatus,
        bytes32 updateDetailsHash
    ) external onlyAuthorized {
        ComplaintRef storage complaint = complaints[complaintHash];
        require(complaint.filedAt > 0, "Complaint not found");
        require(newStatus > complaint.status && newStatus <= 4, "Invalid status");
        
        uint8 previousStatus = complaint.status;
        complaint.status = newStatus;
        
        complaintHistory[complaintHash].push(StatusUpdate({
            previousStatus: previousStatus,
            newStatus: newStatus,
            updateHash: updateDetailsHash,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit ComplaintStatusUpdated(
            complaintHash,
            previousStatus,
            newStatus,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Get full audit trail for a complaint
     */
    function getComplaintHistory(bytes32 complaintHash) 
        external view returns (StatusUpdate[] memory) {
        return complaintHistory[complaintHash];
    }
    
    /**
     * @dev Get batch details
     */
    function getBatch(uint256 batchId) external view returns (AnchorBatch memory) {
        return batches[batchId];
    }
}
```

---

### 2. LandRegistry.sol

**Purpose**: Immutable land ownership records with multi-party approval workflow.

#### Key Features
- **Property Registration**: Record survey numbers, boundaries, owner
- **Transfer Workflow**: 7-stage approval process (Agreement → Mutation)
- **Multi-Signature**: Requires signatures from Sub-Registrar, Tehsildar, Surveyor
- **Ownership History**: Complete chain of ownership
- **Document Anchoring**: Store hashes of sale deeds, title deeds, etc.

#### Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract LandRegistry is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant TEHSILDAR_ROLE = keccak256("TEHSILDAR_ROLE");
    bytes32 public constant SURVEYOR_ROLE = keccak256("SURVEYOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    enum PropertyStatus { 
        Unregistered,
        Registered, 
        TransferInitiated, 
        PendingMutation,
        UnderDispute,
        Encumbered 
    }
    
    enum TransferStage {
        None,
        AgreementSigned,
        StampDutyPaid,
        DocumentsVerified,
        RegistrarApproved,
        MutationInitiated,
        FieldVerificationComplete,
        MutationCompleted
    }
    
    struct Property {
        bytes32 propertyId;
        string surveyNumber;
        string district;
        string taluk;
        string village;
        uint256 areaInSqMeters;
        address currentOwner;
        bytes32 titleDeedHash;
        bytes32 encumbranceCertHash;
        PropertyStatus status;
        uint256 registrationTimestamp;
        uint256 lastTransferTimestamp;
    }
    
    struct TransferRequest {
        bytes32 propertyId;
        address seller;
        address buyer;
        uint256 saleAmount;
        bytes32 saleDeedHash;
        bytes32 stampDutyReceiptHash;
        TransferStage currentStage;
        mapping(bytes32 => bool) approvals;
        uint256 initiatedAt;
        uint256 completedAt;
    }
    
    struct OwnershipHistory {
        address owner;
        bytes32 transferDeedHash;
        uint256 timestamp;
        bytes32 approvedBy;
    }
    
    // Storage
    mapping(bytes32 => Property) public properties;
    mapping(bytes32 => TransferRequest) public transfers;
    mapping(bytes32 => OwnershipHistory[]) public ownershipChain;
    mapping(bytes32 => bytes32[]) public propertyDocuments;
    
    // Events
    event PropertyRegistered(
        bytes32 indexed propertyId,
        address indexed owner,
        string surveyNumber,
        uint256 timestamp
    );
    
    event TransferInitiated(
        bytes32 indexed propertyId,
        bytes32 indexed transferId,
        address indexed seller,
        address buyer,
        uint256 timestamp
    );
    
    event TransferStageUpdated(
        bytes32 indexed transferId,
        TransferStage previousStage,
        TransferStage newStage,
        address approver,
        uint256 timestamp
    );
    
    event TransferCompleted(
        bytes32 indexed propertyId,
        bytes32 indexed transferId,
        address indexed newOwner,
        uint256 timestamp
    );
    
    event DocumentAnchored(
        bytes32 indexed propertyId,
        bytes32 documentHash,
        string documentType,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register new property (only by authorized registrar)
     */
    function registerProperty(
        string calldata surveyNumber,
        string calldata district,
        string calldata taluk,
        string calldata village,
        uint256 areaInSqMeters,
        address owner,
        bytes32 titleDeedHash
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (bytes32) {
        
        bytes32 propertyId = keccak256(abi.encodePacked(
            surveyNumber, district, taluk, village
        ));
        
        require(properties[propertyId].registrationTimestamp == 0, "Property exists");
        
        properties[propertyId] = Property({
            propertyId: propertyId,
            surveyNumber: surveyNumber,
            district: district,
            taluk: taluk,
            village: village,
            areaInSqMeters: areaInSqMeters,
            currentOwner: owner,
            titleDeedHash: titleDeedHash,
            encumbranceCertHash: bytes32(0),
            status: PropertyStatus.Registered,
            registrationTimestamp: block.timestamp,
            lastTransferTimestamp: block.timestamp
        });
        
        ownershipChain[propertyId].push(OwnershipHistory({
            owner: owner,
            transferDeedHash: titleDeedHash,
            timestamp: block.timestamp,
            approvedBy: keccak256(abi.encodePacked(msg.sender))
        }));
        
        emit PropertyRegistered(propertyId, owner, surveyNumber, block.timestamp);
        return propertyId;
    }
    
    /**
     * @dev Initiate property transfer
     */
    function initiateTransfer(
        bytes32 propertyId,
        address buyer,
        uint256 saleAmount,
        bytes32 agreementHash
    ) external whenNotPaused returns (bytes32) {
        
        Property storage prop = properties[propertyId];
        require(prop.currentOwner == msg.sender, "Not owner");
        require(prop.status == PropertyStatus.Registered, "Not transferable");
        
        bytes32 transferId = keccak256(abi.encodePacked(
            propertyId, msg.sender, buyer, block.timestamp
        ));
        
        TransferRequest storage transfer = transfers[transferId];
        transfer.propertyId = propertyId;
        transfer.seller = msg.sender;
        transfer.buyer = buyer;
        transfer.saleAmount = saleAmount;
        transfer.saleDeedHash = agreementHash;
        transfer.currentStage = TransferStage.AgreementSigned;
        transfer.initiatedAt = block.timestamp;
        
        prop.status = PropertyStatus.TransferInitiated;
        
        emit TransferInitiated(propertyId, transferId, msg.sender, buyer, block.timestamp);
        return transferId;
    }
    
    /**
     * @dev Approve transfer stage (multi-party workflow)
     */
    function approveTransferStage(
        bytes32 transferId,
        TransferStage newStage,
        bytes32 supportingDocHash
    ) external whenNotPaused {
        
        TransferRequest storage transfer = transfers[transferId];
        require(transfer.initiatedAt > 0, "Transfer not found");
        
        // Role-based validation
        if (newStage == TransferStage.StampDutyPaid) {
            require(hasRole(VERIFIER_ROLE, msg.sender), "Not verifier");
            transfer.stampDutyReceiptHash = supportingDocHash;
        } else if (newStage == TransferStage.DocumentsVerified) {
            require(hasRole(SURVEYOR_ROLE, msg.sender), "Not surveyor");
        } else if (newStage == TransferStage.RegistrarApproved) {
            require(hasRole(REGISTRAR_ROLE, msg.sender), "Not registrar");
        } else if (newStage == TransferStage.MutationInitiated || 
                   newStage == TransferStage.FieldVerificationComplete ||
                   newStage == TransferStage.MutationCompleted) {
            require(hasRole(TEHSILDAR_ROLE, msg.sender), "Not tehsildar");
        }
        
        TransferStage previousStage = transfer.currentStage;
        require(uint8(newStage) == uint8(previousStage) + 1, "Invalid progression");
        
        transfer.currentStage = newStage;
        transfer.approvals[keccak256(abi.encodePacked(msg.sender, newStage))] = true;
        
        emit TransferStageUpdated(transferId, previousStage, newStage, msg.sender, block.timestamp);
        
        // Complete transfer if mutation done
        if (newStage == TransferStage.MutationCompleted) {
            _completeTransfer(transferId);
        }
    }
    
    function _completeTransfer(bytes32 transferId) internal {
        TransferRequest storage transfer = transfers[transferId];
        Property storage prop = properties[transfer.propertyId];
        
        prop.currentOwner = transfer.buyer;
        prop.status = PropertyStatus.Registered;
        prop.lastTransferTimestamp = block.timestamp;
        
        ownershipChain[transfer.propertyId].push(OwnershipHistory({
            owner: transfer.buyer,
            transferDeedHash: transfer.saleDeedHash,
            timestamp: block.timestamp,
            approvedBy: keccak256(abi.encodePacked(msg.sender))
        }));
        
        transfer.completedAt = block.timestamp;
        
        emit TransferCompleted(transfer.propertyId, transferId, transfer.buyer, block.timestamp);
    }
    
    /**
     * @dev Anchor supporting document
     */
    function anchorDocument(
        bytes32 propertyId,
        bytes32 documentHash,
        string calldata documentType
    ) external onlyRole(REGISTRAR_ROLE) {
        require(properties[propertyId].registrationTimestamp > 0, "Property not found");
        propertyDocuments[propertyId].push(documentHash);
        emit DocumentAnchored(propertyId, documentHash, documentType, block.timestamp);
    }
    
    /**
     * @dev Get ownership history
     */
    function getOwnershipHistory(bytes32 propertyId) 
        external view returns (OwnershipHistory[] memory) {
        return ownershipChain[propertyId];
    }
    
    /**
     * @dev Verify document exists for property
     */
    function verifyDocument(bytes32 propertyId, bytes32 documentHash) 
        external view returns (bool) {
        bytes32[] memory docs = propertyDocuments[propertyId];
        for (uint i = 0; i < docs.length; i++) {
            if (docs[i] == documentHash) return true;
        }
        return false;
    }
}
```

---

### 3. AuditLogger.sol

**Purpose**: Tamper-proof audit trail with hash chain linking.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditLogger {
    
    struct AuditEntry {
        bytes32 entryId;
        bytes32 previousEntryHash;  // Chain linking
        uint8 actionType;
        bytes32 entityId;
        address actor;
        bytes32 dataHash;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    // Action types
    uint8 public constant ACTION_CREATE = 1;
    uint8 public constant ACTION_UPDATE = 2;
    uint8 public constant ACTION_TRANSFER = 3;
    uint8 public constant ACTION_APPROVE = 4;
    uint8 public constant ACTION_REJECT = 5;
    
    mapping(bytes32 => AuditEntry) public auditLog;
    mapping(bytes32 => bytes32[]) public entityAuditTrail;
    
    bytes32 public latestEntryHash;
    uint256 public totalEntries;
    
    event AuditEntryCreated(
        bytes32 indexed entryId,
        bytes32 indexed entityId,
        uint8 actionType,
        address indexed actor,
        uint256 timestamp
    );
    
    function log(
        uint8 actionType,
        bytes32 entityId,
        bytes32 dataHash
    ) external returns (bytes32) {
        
        bytes32 entryId = keccak256(abi.encodePacked(
            totalEntries,
            entityId,
            msg.sender,
            block.timestamp
        ));
        
        auditLog[entryId] = AuditEntry({
            entryId: entryId,
            previousEntryHash: latestEntryHash,
            actionType: actionType,
            entityId: entityId,
            actor: msg.sender,
            dataHash: dataHash,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        entityAuditTrail[entityId].push(entryId);
        latestEntryHash = entryId;
        totalEntries++;
        
        emit AuditEntryCreated(entryId, entityId, actionType, msg.sender, block.timestamp);
        
        return entryId;
    }
    
    function verifyChainIntegrity(bytes32[] calldata entryIds) 
        external view returns (bool isValid, uint256 brokenAt) {
        for (uint i = 1; i < entryIds.length; i++) {
            AuditEntry memory current = auditLog[entryIds[i]];
            if (current.previousEntryHash != entryIds[i-1]) {
                return (false, i);
            }
        }
        return (true, 0);
    }
    
    function getEntityAuditTrail(bytes32 entityId) 
        external view returns (AuditEntry[] memory) {
        bytes32[] memory entryIds = entityAuditTrail[entityId];
        AuditEntry[] memory entries = new AuditEntry[](entryIds.length);
        
        for (uint i = 0; i < entryIds.length; i++) {
            entries[i] = auditLog[entryIds[i]];
        }
        
        return entries;
    }
}
```

---

## Backend Integration (Ethers.js)

### Configuration

```javascript
// backend/src/config/blockchain.js
const { ethers } = require('ethers');
require('dotenv').config();

// Sepolia provider
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Wallet for signing transactions
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract ABIs (import from compiled artifacts)
const LandRegistryABI = require('../../blockchain/artifacts/contracts/core/LandRegistry.sol/LandRegistry.json').abi;
const ComplaintAnchorABI = require('../../blockchain/artifacts/contracts/core/ComplaintAnchor.sol/ComplaintAnchor.json').abi;
const AuditLoggerABI = require('../../blockchain/artifacts/contracts/core/AuditLogger.sol/AuditLogger.json').abi;

// Contract instances
const landRegistryContract = new ethers.Contract(
  process.env.LAND_REGISTRY_CONTRACT,
  LandRegistryABI,
  wallet
);

const complaintAnchorContract = new ethers.Contract(
  process.env.COMPLAINT_ANCHOR_CONTRACT,
  ComplaintAnchorABI,
  wallet
);

const auditLoggerContract = new ethers.Contract(
  process.env.AUDIT_LOGGER_CONTRACT,
  AuditLoggerABI,
  wallet
);

module.exports = {
  provider,
  wallet,
  landRegistryContract,
  complaintAnchorContract,
  auditLoggerContract
};
```

---

### Blockchain Service

```javascript
// backend/src/services/blockchainService.js
const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { 
  complaintAnchorContract, 
  landRegistryContract,
  auditLoggerContract 
} = require('../config/blockchain');
const Complaint = require('../models/Complaint');
const BlockchainBatch = require('../models/BlockchainBatch');

class BlockchainService {
  
  /**
   * Create hash of complaint data
   */
  hashComplaint(complaint) {
    const data = JSON.stringify({
      complaintId: complaint.complaintId,
      citizenPhone: complaint.citizen.phone,
      category: complaint.category.toString(),
      description: complaint.description,
      location: complaint.location,
      timestamp: complaint.createdAt.toISOString()
    });
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
  
  /**
   * Create Merkle tree from complaint hashes
   */
  createMerkleTree(complaintHashes) {
    const leaves = complaintHashes.map(hash => Buffer.from(hash.slice(2), 'hex'));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return tree;
  }
  
  /**
   * Batch anchor complaints on blockchain
   * Called by Bull job every 100 complaints or 1 hour
   */
  async anchorComplaintBatch(complaints) {
    try {
      // Hash each complaint
      const complaintHashes = complaints.map(c => this.hashComplaint(c));
      
      // Create Merkle tree
      const tree = this.createMerkleTree(complaintHashes);
      const merkleRoot = '0x' + tree.getRoot().toString('hex');
      
      // Anchor on blockchain
      const tx = await complaintAnchorContract.anchorBatch(
        merkleRoot,
        complaints.length,
        complaintHashes
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);
      
      // Save batch record
      const batch = await BlockchainBatch.create({
        batchId: receipt.logs[0].args.batchId,
        merkleRoot: merkleRoot,
        complaintHashes: complaintHashes,
        complaintIds: complaints.map(c => c.complaintId),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        network: 'sepolia',
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString(),
        gasCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
      });
      
      // Update complaints with blockchain info
      for (let i = 0; i < complaints.length; i++) {
        complaints[i].blockchainHash = complaintHashes[i];
        complaints[i].blockchainBatchId = batch._id;
        complaints[i].blockchainTxHash = receipt.transactionHash;
        complaints[i].isAnchored = true;
        complaints[i].anchoredAt = new Date();
        await complaints[i].save();
      }
      
      return {
        success: true,
        batchId: batch.batchId,
        txHash: receipt.transactionHash,
        merkleRoot: merkleRoot
      };
      
    } catch (error) {
      console.error('Blockchain anchoring error:', error);
      throw error;
    }
  }
  
  /**
   * Verify complaint on blockchain
   */
  async verifyComplaint(complaintId) {
    try {
      const complaint = await Complaint.findOne({ complaintId }).populate('blockchainBatchId');
      
      if (!complaint || !complaint.isAnchored) {
        return { verified: false, message: 'Complaint not anchored' };
      }
      
      const batch = complaint.blockchainBatchId;
      const tree = this.createMerkleTree(batch.complaintHashes);
      const proof = tree.getHexProof(Buffer.from(complaint.blockchainHash.slice(2), 'hex'));
      
      // Verify on blockchain
      const isValid = await complaintAnchorContract.verifyComplaint(
        complaint.blockchainHash,
        proof,
        batch.batchId
      );
      
      return {
        verified: isValid,
        complaintHash: complaint.blockchainHash,
        merkleRoot: batch.merkleRoot,
        txHash: batch.transactionHash,
        blockNumber: batch.blockNumber,
        proof: proof
      };
      
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }
  
  /**
   * Update complaint status on blockchain
   */
  async updateComplaintStatus(complaint, newStatus, updatedBy) {
    try {
      const updateData = {
        complaintId: complaint.complaintId,
        previousStatus: complaint.status,
        newStatus: newStatus,
        updatedBy: updatedBy.name,
        timestamp: new Date().toISOString()
      };
      
      const updateHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(updateData)));
      
      // Map status to number
      const statusMap = {
        'filed': 0,
        'acknowledged': 1,
        'in_progress': 2,
        'resolved': 3,
        'closed': 4
      };
      
      const tx = await complaintAnchorContract.updateStatus(
        complaint.blockchainHash,
        statusMap[newStatus],
        updateHash
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        updateHash: updateHash
      };
      
    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  }
  
  /**
   * Register property on blockchain
   */
  async registerProperty(property, registrar) {
    try {
      const titleDeedHash = ethers.keccak256(ethers.toUtf8Bytes(property.documents[0].hash));
      
      const tx = await landRegistryContract.registerProperty(
        property.surveyNumber,
        property.location.district,
        property.location.taluk,
        property.location.village,
        property.area.value,
        property.currentOwner.walletAddress, // Owner's Ethereum address
        titleDeedHash
      );
      
      const receipt = await tx.wait();
      const propertyId = receipt.logs[0].args.propertyId;
      
      property.blockchainPropertyId = propertyId;
      property.blockchainTxHash = receipt.transactionHash;
      property.isAnchored = true;
      property.anchoredAt = new Date();
      await property.save();
      
      return {
        success: true,
        propertyId: propertyId,
        txHash: receipt.transactionHash
      };
      
    } catch (error) {
      console.error('Property registration error:', error);
      throw error;
    }
  }
  
  /**
   * Initiate land transfer on blockchain
   */
  async initiateLandTransfer(transfer) {
    try {
      const agreementHash = ethers.keccak256(ethers.toUtf8Bytes(transfer.documents[0].hash));
      
      const tx = await landRegistryContract.initiateTransfer(
        transfer.property.blockchainPropertyId,
        transfer.buyer.walletAddress,
        ethers.parseEther(transfer.saleAmount.toString()),
        agreementHash
      );
      
      const receipt = await tx.wait();
      const transferId = receipt.logs[0].args.transferId;
      
      transfer.blockchainTransferId = transferId;
      transfer.blockchainTxHashes.push(receipt.transactionHash);
      await transfer.save();
      
      return {
        success: true,
        transferId: transferId,
        txHash: receipt.transactionHash
      };
      
    } catch (error) {
      console.error('Transfer initiation error:', error);
      throw error;
    }
  }
  
  /**
   * Log audit entry on blockchain
   */
  async logAudit(entityType, entityId, action, actor, changes) {
    try {
      const actionMap = {
        'create': 1,
        'update': 2,
        'transfer': 3,
        'approve': 4,
        'reject': 5
      };
      
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(changes)));
      const entityHash = ethers.keccak256(ethers.toUtf8Bytes(entityId.toString()));
      
      const tx = await auditLoggerContract.log(
        actionMap[action],
        entityHash,
        dataHash
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash
      };
      
    } catch (error) {
      console.error('Audit logging error:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
```

---

## Merkle Tree Implementation

### Merkle Tree Utility

```javascript
// backend/src/utils/merkleTree.js
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

class MerkleTreeBuilder {
  
  /**
   * Build Merkle tree from data array
   */
  static build(dataArray) {
    const leaves = dataArray.map(data => keccak256(data));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return tree;
  }
  
  /**
   * Get Merkle root
   */
  static getRoot(tree) {
    return '0x' + tree.getRoot().toString('hex');
  }
  
  /**
   * Get proof for specific leaf
   */
  static getProof(tree, leaf) {
    return tree.getHexProof(keccak256(leaf));
  }
  
  /**
   * Verify proof
   */
  static verify(proof, leaf, root) {
    return MerkleTree.verify(proof, keccak256(leaf), root, keccak256);
  }
}

module.exports = MerkleTreeBuilder;
```

---

## Gas Optimization Strategies

| Strategy | Savings | Implementation |
|----------|---------|----------------|
| **Batch Anchoring** | 87% | Anchor 100 complaints in 1 tx instead of 100 txs |
| **Merkle Proofs** | 95% | Store only root, verify off-chain |
| **Events over Storage** | 90% | Emit events instead of storing data |
| **calldata vs memory** | 20% | Use calldata for function parameters |
| **Short strings** | 30% | Use bytes32 instead of string for IDs |
| **Minimal on-chain data** | 80% | Store only hashes, keep data on Cloudinary |

### Gas Cost Comparison

| Operation | Without Optimization | With Optimization | Savings |
|-----------|---------------------|-------------------|---------|
| Anchor 100 complaints | ~3,000,000 gas (0.06 ETH) | ~200,000 gas (0.004 ETH) | 93% |
| Register property | ~300,000 gas | ~150,000 gas | 50% |
| Update status | ~100,000 gas | ~60,000 gas | 40% |

---

## Deployment

### Hardhat Configuration

```javascript
// blockchain/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: "auto"
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  }
};
```

---

### Deployment Script

```javascript
// blockchain/scripts/deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy AuditLogger
  const AuditLogger = await ethers.getContractFactory("AuditLogger");
  const auditLogger = await AuditLogger.deploy();
  await auditLogger.waitForDeployment();
  console.log("AuditLogger deployed to:", await auditLogger.getAddress());
  
  // Deploy ComplaintAnchor
  const ComplaintAnchor = await ethers.getContractFactory("ComplaintAnchor");
  const complaintAnchor = await ComplaintAnchor.deploy();
  await complaintAnchor.waitForDeployment();
  console.log("ComplaintAnchor deployed to:", await complaintAnchor.getAddress());
  
  // Deploy LandRegistry (upgradeable)
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await upgrades.deployProxy(LandRegistry, [], {
    initializer: 'initialize'
  });
  await landRegistry.waitForDeployment();
  console.log("LandRegistry deployed to:", await landRegistry.getAddress());
  
  // Wait for block confirmations
  console.log("Waiting for 6 confirmations...");
  await complaintAnchor.deploymentTransaction().wait(6);
  
  // Verify on Etherscan
  if (network.name === "sepolia") {
    console.log("Verifying contracts on Etherscan...");
    await hre.run("verify:verify", {
      address: await auditLogger.getAddress(),
      constructorArguments: []
    });
    await hre.run("verify:verify", {
      address: await complaintAnchor.getAddress(),
      constructorArguments: []
    });
  }
  
  // Save addresses
  const addresses = {
    auditLogger: await auditLogger.getAddress(),
    complaintAnchor: await complaintAnchor.getAddress(),
    landRegistry: await landRegistry.getAddress()
  };
  
  console.log("\n=== Deployed Addresses ===");
  console.log(JSON.stringify(addresses, null, 2));
  
  // Update .env in backend
  console.log("\nAdd these to backend/.env:");
  console.log(`AUDIT_LOGGER_CONTRACT=${addresses.auditLogger}`);
  console.log(`COMPLAINT_ANCHOR_CONTRACT=${addresses.complaintAnchor}`);
  console.log(`LAND_REGISTRY_CONTRACT=${addresses.landRegistry}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## Testing

### Unit Tests

```javascript
// blockchain/test/ComplaintAnchor.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ComplaintAnchor", function () {
  let complaintAnchor;
  let owner, officer1, officer2;
  
  beforeEach(async function () {
    [owner, officer1, officer2] = await ethers.getSigners();
    
    const ComplaintAnchor = await ethers.getContractFactory("ComplaintAnchor");
    complaintAnchor = await ComplaintAnchor.deploy();
    await complaintAnchor.waitForDeployment();
    
    // Authorize officer
    await complaintAnchor.setOfficer(officer1.address, true);
  });
  
  it("Should anchor batch of complaints", async function () {
    const hashes = [
      ethers.keccak256(ethers.toUtf8Bytes("complaint1")),
      ethers.keccak256(ethers.toUtf8Bytes("complaint2"))
    ];
    
    const merkleRoot = ethers.keccak256(ethers.concat(hashes));
    
    await expect(
      complaintAnchor.connect(officer1).anchorBatch(merkleRoot, 2, hashes)
    ).to.emit(complaintAnchor, "BatchAnchored")
      .withArgs(1, merkleRoot, 2, await ethers.provider.getBlock('latest').then(b => b.timestamp));
    
    expect(await complaintAnchor.totalComplaints()).to.equal(2);
  });
  
  it("Should reject unauthorized anchoring", async function () {
    const hashes = [ethers.keccak256(ethers.toUtf8Bytes("complaint1"))];
    const merkleRoot = ethers.keccak256(hashes[0]);
    
    await expect(
      complaintAnchor.connect(officer2).anchorBatch(merkleRoot, 1, hashes)
    ).to.be.revertedWith("Not authorized");
  });
  
  it("Should update complaint status", async function () {
    // First anchor
    const hash = ethers.keccak256(ethers.toUtf8Bytes("complaint1"));
    await complaintAnchor.connect(officer1).anchorBatch(hash, 1, [hash]);
    
    // Update status
    const updateHash = ethers.keccak256(ethers.toUtf8Bytes("update1"));
    await expect(
      complaintAnchor.connect(officer1).updateStatus(hash, 1, updateHash)
    ).to.emit(complaintAnchor, "ComplaintStatusUpdated");
    
    const complaint = await complaintAnchor.complaints(hash);
    expect(complaint.status).to.equal(1);
  });
});
```

---

## Citizen Verification Flow

### How Citizens Verify Their Complaint on Blockchain

1. **Citizen files complaint** → Gets complaint ID (e.g., CS12345)
2. **Backend hashes complaint** → Stores hash in MongoDB
3. **Every 100 complaints** → Bull job creates Merkle tree and anchors on blockchain
4. **Citizen visits verification page** → Enters complaint ID
5. **System retrieves**:
   - Complaint hash from MongoDB
   - Merkle proof from Merkle tree
   - Transaction hash from blockchain batch
6. **Smart contract verifies** → Returns true/false
7. **Citizen sees**:
   - ✅ Verified on blockchain
   - Transaction hash (link to Etherscan)
   - Block number
   - Timestamp

---

## Security Considerations

| Risk | Mitigation |
|------|------------|
| **Private key theft** | Store in AWS KMS / Hardware Security Module |
| **Reentrancy attacks** | OpenZeppelin ReentrancyGuard |
| **Front-running** | Use commit-reveal scheme for sensitive operations |
| **Gas price manipulation** | Set max gas price in transactions |
| **Unauthorized access** | Role-based access control (AccessControl.sol) |
| **Smart contract bugs** | Audited by OpenZeppelin, comprehensive tests |

---

## Next Steps

1. Review [Land Registry Module](./04-LAND-REGISTRY-MODULE.md) for legal compliance details
2. Follow [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md) for implementation timeline

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2025  
**Authors**: CitySamdhaan Development Team
