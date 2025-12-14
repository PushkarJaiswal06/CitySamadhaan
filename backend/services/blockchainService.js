import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load ABIs dynamically
const ComplaintRegistryABI = JSON.parse(
  readFileSync(join(__dirname, '../../blockchain/artifacts/contracts/ComplaintRegistry.sol/ComplaintRegistry.json'), 'utf8')
);
const AuditTrailABI = JSON.parse(
  readFileSync(join(__dirname, '../../blockchain/artifacts/contracts/AuditTrail.sol/AuditTrail.json'), 'utf8')
);

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.complaintRegistry = null;
    this.auditTrail = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Check if required env variables are set
      if (!process.env.BLOCKCHAIN_RPC_URL || !process.env.BLOCKCHAIN_PRIVATE_KEY) {
        console.warn('⚠️ Blockchain not configured. Complaints will not be anchored on-chain.');
        return false;
      }

      // Connect to blockchain
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);

      // Initialize contracts
      this.complaintRegistry = new ethers.Contract(
        process.env.COMPLAINT_REGISTRY_ADDRESS,
        ComplaintRegistryABI.abi,
        this.wallet
      );

      this.auditTrail = new ethers.Contract(
        process.env.AUDIT_TRAIL_ADDRESS,
        AuditTrailABI.abi,
        this.wallet
      );

      // Verify connection
      const network = await this.provider.getNetwork();
      console.log(`✅ Blockchain connected: ${network.name} (Chain ID: ${network.chainId})`);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Generate data hash for complaint
   */
  generateComplaintHash(complaintData) {
    const dataString = JSON.stringify({
      complaintId: complaintData.complaintId,
      citizen: complaintData.citizen,
      title: complaintData.title,
      description: complaintData.description,
      department: complaintData.department,
      category: complaintData.category,
      location: complaintData.location,
      timestamp: complaintData.createdAt || new Date().toISOString()
    });
    
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  /**
   * Register complaint on blockchain
   */
  async registerComplaint(complaintData) {
    if (!this.initialized) {
      console.warn('Blockchain not initialized. Skipping on-chain registration.');
      return null;
    }

    try {
      const dataHash = this.generateComplaintHash(complaintData);
      const citizenAddress = complaintData.citizenAddress || ethers.ZeroAddress;

      const tx = await this.complaintRegistry.registerComplaint(
        complaintData.complaintId,
        dataHash,
        citizenAddress,
        complaintData.department
      );

      const receipt = await tx.wait();
      
      console.log(`✅ Complaint ${complaintData.complaintId} anchored on blockchain`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Block: ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        dataHash: dataHash,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to register complaint on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Update complaint status on blockchain
   */
  async updateComplaintStatus(complaintId, statusUpdate) {
    if (!this.initialized) {
      return null;
    }

    try {
      const updateHash = ethers.keccak256(
        ethers.toUtf8Bytes(
          JSON.stringify({
            complaintId,
            status: statusUpdate.status,
            comment: statusUpdate.comment,
            updatedBy: statusUpdate.updatedBy,
            timestamp: statusUpdate.timestamp || new Date().toISOString()
          })
        )
      );

      const tx = await this.complaintRegistry.updateStatus(
        complaintId,
        statusUpdate.status,
        updateHash,
        statusUpdate.comment || ''
      );

      const receipt = await tx.wait();
      
      console.log(`✅ Status update for ${complaintId} anchored on blockchain`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        updateHash: updateHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to update complaint status on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Verify complaint on blockchain
   */
  async verifyComplaint(complaintId, complaintData) {
    if (!this.initialized) {
      return null;
    }

    try {
      const dataHash = this.generateComplaintHash(complaintData);
      const isValid = await this.complaintRegistry.verifyComplaint(complaintId, dataHash);
      
      return {
        verified: isValid,
        dataHash: dataHash
      };
    } catch (error) {
      console.error('Failed to verify complaint:', error.message);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get complaint from blockchain
   */
  async getComplaintFromChain(complaintId) {
    if (!this.initialized) {
      return null;
    }

    try {
      const complaint = await this.complaintRegistry.getComplaint(complaintId);
      
      return {
        dataHash: complaint[0],
        citizen: complaint[1],
        timestamp: Number(complaint[2]),
        status: complaint[3],
        department: complaint[4]
      };
    } catch (error) {
      console.error('Failed to get complaint from blockchain:', error.message);
      return null;
    }
  }

  /**
   * Get complaint status history from blockchain
   */
  async getStatusHistory(complaintId) {
    if (!this.initialized) {
      return [];
    }

    try {
      const history = await this.complaintRegistry.getStatusHistory(complaintId);
      return history.map(update => ({
        status: update.status,
        updateHash: update.updateHash,
        updatedBy: update.updatedBy,
        timestamp: Number(update.timestamp),
        comment: update.comment
      }));
    } catch (error) {
      console.error('Failed to get status history:', error.message);
      return [];
    }
  }

  /**
   * Record audit entry on blockchain
   */
  async recordAudit(auditData) {
    if (!this.initialized) {
      return null;
    }

    try {
      const dataHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(auditData))
      );

      // Map action type to enum
      const actionTypeMap = {
        'USER_CREATED': 0,
        'USER_UPDATED': 1,
        'USER_DELETED': 2,
        'COMPLAINT_CREATED': 3,
        'COMPLAINT_UPDATED': 4,
        'COMPLAINT_ASSIGNED': 5,
        'COMPLAINT_RESOLVED': 6,
        'DEPARTMENT_CREATED': 7,
        'ROLE_ASSIGNED': 8,
        'PERMISSION_CHANGED': 9,
        'DATA_ACCESSED': 10,
        'SYSTEM_CONFIG_CHANGED': 11
      };

      const actionType = actionTypeMap[auditData.actionType] || 3;

      const tx = await this.auditTrail.recordAudit(
        actionType,
        auditData.entityId,
        dataHash,
        auditData.description || ''
      );

      const receipt = await tx.wait();
      
      console.log(`✅ Audit entry recorded on blockchain`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        dataHash: dataHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to record audit:', error.message);
      throw error;
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats() {
    if (!this.initialized) {
      return null;
    }

    try {
      const [totalComplaints, totalAudits] = await Promise.all([
        this.complaintRegistry.getTotalComplaints(),
        this.auditTrail.getTotalAuditEntries()
      ]);

      return {
        totalComplaints: Number(totalComplaints),
        totalAudits: Number(totalAudits),
        network: (await this.provider.getNetwork()).name,
        blockNumber: await this.provider.getBlockNumber()
      };
    } catch (error) {
      console.error('Failed to get blockchain stats:', error.message);
      return null;
    }
  }

  /**
   * Get transaction explorer URL
   */
  getTransactionUrl(txHash) {
    const explorerUrl = process.env.BLOCKCHAIN_EXPLORER_URL || 'https://sepolia.etherscan.io/';
    return `${explorerUrl}tx/${txHash}`;
  }

  /**
   * Get contract explorer URL
   */
  getContractUrl(contractAddress) {
    const explorerUrl = process.env.BLOCKCHAIN_EXPLORER_URL || 'https://sepolia.etherscan.io/';
    return `${explorerUrl}address/${contractAddress}`;
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
