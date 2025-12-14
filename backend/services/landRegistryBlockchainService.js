import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LandRegistryBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Connect to blockchain network
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Get signer from private key
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (!privateKey) {
        console.warn('⚠️  BLOCKCHAIN_PRIVATE_KEY not set. Blockchain features will be limited.');
        return false;
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);

      // Load contract ABI and address
      const contractArtifactPath = path.join(
        __dirname,
        '../../blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json'
      );

      if (!fs.existsSync(contractArtifactPath)) {
        console.warn('⚠️  LandRegistry contract artifact not found. Please deploy the contract first.');
        return false;
      }

      const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, 'utf8'));

      // Get contract address from deployment file
      const deploymentPath = path.join(
        __dirname,
        '../../blockchain/deployment-address.json'
      );

      if (!fs.existsSync(deploymentPath)) {
        console.warn('⚠️  Contract deployment address not found. Please deploy the contract first.');
        return false;
      }

      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      this.contractAddress = deployment.landRegistry;

      // Initialize contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractArtifact.abi,
        this.signer
      );

      console.log('✅ Blockchain service initialized');
      console.log(`   Network: ${(await this.provider.getNetwork()).name}`);
      console.log(`   Contract: ${this.contractAddress}`);
      console.log(`   Signer: ${await this.signer.getAddress()}`);

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
    }
  }

  /**
   * Check if blockchain service is available
   */
  isAvailable() {
    return this.contract !== null;
  }

  /**
   * Generate property hash for blockchain
   */
  generatePropertyHash(propertyData) {
    const dataString = JSON.stringify({
      surveyNumber: propertyData.surveyNumber,
      district: propertyData.location.district,
      state: propertyData.location.state,
      area: propertyData.area,
      propertyType: propertyData.propertyType,
      owner: propertyData.owner
    });
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  /**
   * Generate transfer hash for blockchain
   */
  generateTransferHash(transferData) {
    const dataString = JSON.stringify({
      transferId: transferData.transferId,
      propertyId: transferData.property,
      seller: transferData.seller,
      buyer: transferData.buyer,
      transferType: transferData.transferType,
      saleAmount: transferData.saleAmount
    });
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  /**
   * Convert MongoDB ObjectId to Ethereum address format
   * This creates a deterministic address from user ID
   */
  userIdToAddress(userId) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(userId.toString()));
    return ethers.getAddress('0x' + hash.slice(26)); // Take last 20 bytes
  }

  /**
   * Register property on blockchain
   */
  async registerProperty(propertyData, ownerUserId) {
    if (!this.isAvailable()) {
      console.warn('Blockchain not available, skipping registration');
      return null;
    }

    try {
      const propertyHash = this.generatePropertyHash(propertyData);
      const ownerAddress = this.userIdToAddress(ownerUserId);

      console.log(`📝 Registering property ${propertyData.propertyId} on blockchain...`);

      const tx = await this.contract.registerProperty(
        propertyData.propertyId,
        propertyHash,
        ownerAddress
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`   ✅ Property registered in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        propertyHash: propertyHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to register property on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Verify property on blockchain
   */
  async verifyProperty(propertyId) {
    if (!this.isAvailable()) {
      console.warn('Blockchain not available, skipping verification');
      return null;
    }

    try {
      console.log(`✅ Verifying property ${propertyId} on blockchain...`);

      const tx = await this.contract.verifyProperty(propertyId);
      const receipt = await tx.wait();

      console.log(`   ✅ Property verified in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to verify property on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Add document hash to blockchain
   */
  async addDocument(propertyId, documentHash, documentType) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Convert SHA-256 hash to bytes32
      const bytes32Hash = '0x' + documentHash;

      const tx = await this.contract.addDocument(
        propertyId,
        bytes32Hash,
        documentType
      );

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        documentHash: bytes32Hash
      };
    } catch (error) {
      console.error('Failed to add document on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Initiate transfer on blockchain
   */
  async initiateTransfer(transferData, sellerUserId, buyerUserId) {
    if (!this.isAvailable()) {
      console.warn('Blockchain not available, skipping transfer initiation');
      return null;
    }

    try {
      const transferHash = this.generateTransferHash(transferData);
      const sellerAddress = this.userIdToAddress(sellerUserId);
      const buyerAddress = this.userIdToAddress(buyerUserId);

      console.log(`🔄 Initiating transfer ${transferData.transferId} on blockchain...`);

      const tx = await this.contract.initiateTransfer(
        transferData.transferId,
        transferData.propertyId,
        sellerAddress,
        buyerAddress,
        ethers.parseEther(transferData.saleAmount?.toString() || '0'),
        transferHash
      );

      const receipt = await tx.wait();
      console.log(`   ✅ Transfer initiated in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        transferHash: transferHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to initiate transfer on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Update transfer stage on blockchain
   */
  async updateTransferStage(transferId, propertyId, stage) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      console.log(`📝 Updating transfer ${transferId} stage to ${stage}...`);

      const tx = await this.contract.updateTransferStage(
        transferId,
        propertyId,
        stage
      );

      const receipt = await tx.wait();
      console.log(`   ✅ Stage updated in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to update transfer stage on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Complete transfer on blockchain
   */
  async completeTransfer(transferId, propertyId) {
    if (!this.isAvailable()) {
      console.warn('Blockchain not available, skipping transfer completion');
      return null;
    }

    try {
      console.log(`✅ Completing transfer ${transferId} on blockchain...`);

      const tx = await this.contract.completeTransfer(transferId, propertyId);
      const receipt = await tx.wait();

      console.log(`   ✅ Transfer completed in block ${receipt.blockNumber}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to complete transfer on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Get property from blockchain
   */
  async getProperty(propertyId) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const property = await this.contract.getProperty(propertyId);
      return {
        propertyId: property[0],
        propertyHash: property[1],
        currentOwner: property[2],
        registrationDate: Number(property[3]),
        isVerified: property[4],
        isActive: property[5]
      };
    } catch (error) {
      console.error('Failed to get property from blockchain:', error.message);
      return null;
    }
  }

  /**
   * Verify document hash on blockchain
   */
  async verifyDocumentHash(documentHash) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const bytes32Hash = '0x' + documentHash;
      return await this.contract.verifyDocumentHash(bytes32Hash);
    } catch (error) {
      console.error('Failed to verify document hash:', error.message);
      return false;
    }
  }

  /**
   * Get transfer history from blockchain
   */
  async getTransferHistory(propertyId) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const transfers = await this.contract.getTransferHistory(propertyId);
      return transfers.map(t => ({
        transferId: t.transferId,
        propertyId: t.propertyId,
        transferHash: t.transferHash,
        seller: t.seller,
        buyer: t.buyer,
        saleAmount: ethers.formatEther(t.saleAmount),
        transferDate: Number(t.transferDate),
        stage: t.stage,
        isCompleted: t.isCompleted
      }));
    } catch (error) {
      console.error('Failed to get transfer history:', error.message);
      return [];
    }
  }
}

// Create singleton instance
const landRegistryBlockchain = new LandRegistryBlockchainService();

export default landRegistryBlockchain;
