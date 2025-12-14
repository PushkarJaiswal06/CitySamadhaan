# 🏛️ Land Registry Blockchain Setup

## Overview
The Land Registry module is now blockchain-enabled! Property registrations, transfers, and verifications are recorded on an immutable blockchain ledger, ensuring transparency and tamper-proof records.

## Architecture

### Smart Contract: LandRegistry.sol
- **Property Registration**: Records property details with cryptographic hashes
- **Ownership Tracking**: Maintains complete ownership history on-chain
- **Transfer Workflow**: Manages multi-stage transfer approvals
- **Document Verification**: Stores document hashes for authenticity checks
- **Official Verification**: Multi-party approval system (Surveyor, Sub-Registrar, Tehsildar)

### Backend Integration
- **landRegistryBlockchainService.js**: Connects backend to smart contract
- **landController.js**: Automatically records property operations on blockchain
- **MongoDB + Blockchain**: Dual storage for performance and immutability

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd blockchain
npm install
```

### 2. Start Local Blockchain
```bash
# Terminal 1 - Start Hardhat local network
npx hardhat node
```

This will:
- Start a local Ethereum node at http://127.0.0.1:8545
- Create 20 test accounts with 10,000 ETH each
- Display private keys for testing

### 3. Deploy Smart Contract
```bash
# Terminal 2 - Deploy LandRegistry contract
npx hardhat run scripts/deploy-land-registry.js --network localhost
```

Expected output:
```
🚀 Deploying LandRegistry contract...
📝 Deploying with account: 0x...
✅ LandRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
💾 Deployment info saved to: deployment-address.json
```

### 4. Configure Backend
Add to `backend/.env`:
```env
LAND_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
LAND_BLOCKCHAIN_PRIVATE_KEY=<your_private_key_from_hardhat_node>
```

**Note**: Use Account #0's private key from the Hardhat node output (without 0x prefix)

### 5. Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
✅ Land Registry Blockchain Service Connected
   Network: localhost
   Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Signer: 0x...
🚀 Server running on port 5000
```

## Testing Blockchain Integration

### Register a Property
```bash
# Login and get JWT token
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"phone": "9876543210", "password": "password123"}'

# Register property (will be recorded on blockchain)
curl -X POST http://localhost:5000/api/land/properties \\
  -H "Authorization: Bearer <your_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "surveyNumber": "123/45",
    "location": {
      "district": "Pune",
      "state": "Maharashtra",
      "address": "Plot 45, Sector 7"
    },
    "area": 1200,
    "propertyType": "residential"
  }'
```

### Verify Blockchain Transaction
The response will include:
```json
{
  "success": true,
  "data": {
    "property": {
      "propertyId": "PROP-MH-PUN-2024-000001",
      "blockchain": {
        "propertyHash": "0x123abc...",
        "txHash": "0x456def...",
        "blockNumber": 2,
        "verified": false
      }
    }
  }
}
```

Check transaction on local blockchain:
```bash
npx hardhat console --network localhost
```

```javascript
const LandRegistry = await ethers.getContractFactory("LandRegistry");
const contract = LandRegistry.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Get property from blockchain
const property = await contract.getProperty("PROP-MH-PUN-2024-000001");
console.log(property);
```

## Deployment to Testnet (Sepolia)

### 1. Get Testnet ETH
- Visit https://sepoliafaucet.com/
- Enter your wallet address
- Receive free Sepolia ETH for testing

### 2. Configure for Sepolia
Update `blockchain/.env`:
```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=<your_wallet_private_key>
ETHERSCAN_API_KEY=<optional_for_verification>
```

### 3. Deploy to Sepolia
```bash
npx hardhat run scripts/deploy-land-registry.js --network sepolia
```

### 4. Update Backend
Update `backend/.env`:
```env
LAND_BLOCKCHAIN_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
LAND_BLOCKCHAIN_PRIVATE_KEY=<your_wallet_private_key>
```

### 5. Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia <contract_address>
```

## Smart Contract Functions

### Property Management
- `registerProperty(propertyId, propertyHash, owner)` - Register new property
- `verifyProperty(propertyId)` - Mark property as verified by official
- `addDocument(propertyId, documentHash, documentType)` - Add document hash
- `getProperty(propertyId)` - Get property details from blockchain

### Transfer Management
- `initiateTransfer(transferId, propertyId, seller, buyer, amount, transferHash)` - Start transfer
- `updateTransferStage(transferId, propertyId, stage)` - Update transfer stage
- `completeTransfer(transferId, propertyId)` - Complete transfer and update ownership
- `getTransferHistory(propertyId)` - Get all transfers for a property

### Verification
- `verifyDocumentHash(documentHash)` - Check if document exists on blockchain
- `getPropertiesByOwner(ownerAddress)` - Get all properties owned by an address

### Admin Functions
- `addVerifier(address, role)` - Add authorized official (surveyor, registrar, etc.)
- `removeVerifier(address)` - Remove verifier access

## Blockchain Data Flow

### Property Registration
1. User submits property details via API
2. Backend saves to MongoDB
3. Backend calls `landRegistryBlockchain.registerProperty()`
4. Smart contract emits `PropertyRegistered` event
5. Transaction hash and block number stored in MongoDB
6. Frontend displays blockchain verification badge

### Property Verification
1. Official (surveyor/registrar/tehsildar) approves property
2. Backend updates MongoDB verification status
3. Backend calls `landRegistryBlockchain.verifyProperty()`
4. Smart contract emits `PropertyVerified` event
5. Property marked as verified on-chain

### Transfer Initiation
1. Owner initiates transfer via API
2. Backend creates transfer record in MongoDB
3. Backend calls `landRegistryBlockchain.initiateTransfer()`
4. Smart contract records transfer details
5. Transfer ID and blockchain hash returned

### Transfer Completion
1. All officials approve transfer stages
2. Backend advances transfer to "completed"
3. Backend calls `landRegistryBlockchain.completeTransfer()`
4. Smart contract updates property ownership on-chain
5. Ownership history permanently recorded

## Security Features

### On-Chain Security
- **Role-based Access**: Only authorized officials can verify/approve
- **Immutable Records**: Property history cannot be altered
- **Cryptographic Hashing**: SHA-256 hashes for all documents
- **Multi-party Approval**: Transfer requires multiple official signatures

### Off-Chain Security
- **JWT Authentication**: API endpoints protected
- **User ID to Address Mapping**: Deterministic address generation
- **Graceful Degradation**: System continues if blockchain unavailable
- **Error Handling**: Blockchain failures don't break application

## Monitoring & Debugging

### Check Blockchain Connection
```bash
curl http://localhost:5000/health
```

Look for:
```json
{
  "blockchain": {
    "enabled": true,
    "network": "localhost",
    "blockNumber": 42
  }
}
```

### View Contract Events
```bash
npx hardhat console --network localhost
```

```javascript
const contract = await ethers.getContractAt("LandRegistry", "<contract_address>");

// Listen for property registrations
contract.on("PropertyRegistered", (propertyId, hash, owner, timestamp) => {
  console.log("Property Registered:", propertyId);
});

// Listen for transfers
contract.on("TransferInitiated", (transferId, propertyId, seller, buyer) => {
  console.log("Transfer Started:", transferId);
});
```

### Troubleshooting

#### Error: "Blockchain not available"
- Check if Hardhat node is running: `npx hardhat node`
- Verify RPC URL in .env: `LAND_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`
- Check contract is deployed: `ls blockchain/deployment-address.json`

#### Error: "Contract not deployed"
- Run deployment script: `npx hardhat run scripts/deploy-land-registry.js --network localhost`
- Check deployment-address.json exists and has correct contract address

#### Error: "Insufficient funds"
- Ensure signer account has ETH
- For local: Use Account #0 from Hardhat node
- For testnet: Get testnet ETH from faucet

#### Error: "Module not found"
- Install dependencies: `cd blockchain && npm install`
- Install ethers: `npm install ethers@6`

## Gas Optimization

Average gas costs (on localhost):
- Register Property: ~250,000 gas
- Verify Property: ~50,000 gas
- Add Document: ~80,000 gas
- Initiate Transfer: ~300,000 gas
- Complete Transfer: ~200,000 gas

**Total for complete flow**: ~880,000 gas (~$5-10 on mainnet at 50 gwei)

## Production Considerations

### Mainnet Deployment
⚠️ **WARNING**: Deploying to Ethereum mainnet requires real ETH and incurs costs.

For production, consider:
1. **Layer 2 Solutions**: Deploy on Polygon, Arbitrum, or Optimism for lower fees
2. **Private Blockchain**: Use Hyperledger Besu or Quorum for consortium setup
3. **Gas Optimization**: Batch operations, optimize storage
4. **Monitoring**: Set up Chainlink Keepers for automated tasks
5. **Backup**: Maintain off-chain backups of critical data

### Recommended Networks
- **Development**: Hardhat local node (free)
- **Testing**: Sepolia testnet (free ETH from faucets)
- **Staging**: Polygon Mumbai testnet (free MATIC)
- **Production**: Polygon mainnet (low fees, ~$0.01 per transaction)

## File Structure
```
blockchain/
├── contracts/
│   ├── LandRegistry.sol          # Main smart contract
│   ├── ComplaintRegistry.sol     # Existing complaint contract
│   └── AuditTrail.sol           # Existing audit contract
├── scripts/
│   ├── deploy-land-registry.js  # Deployment script
│   └── generate-wallet.js       # Wallet generator
├── hardhat.config.js            # Network configuration
├── deployment-address.json      # Contract addresses (generated)
└── package.json

backend/
├── services/
│   └── landRegistryBlockchainService.js  # Blockchain integration
├── controllers/
│   └── landController.js                 # Updated with blockchain calls
└── .env                                  # Blockchain configuration
```

## Next Steps

1. ✅ Deploy smart contract locally
2. ✅ Configure backend .env
3. ✅ Test property registration with blockchain
4. ⏳ Add blockchain verification UI in frontend
5. ⏳ Display transaction hashes and block explorer links
6. ⏳ Create admin dashboard for blockchain stats
7. ⏳ Deploy to testnet for public testing

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Sepolia Testnet Explorer](https://sepolia.etherscan.io/)
- [Polygon Documentation](https://docs.polygon.technology/)

## Support

For issues or questions:
1. Check logs: `backend` console and `hardhat node` output
2. Review this documentation
3. Check contract events in Hardhat console
4. Verify .env configuration

---

**Built with ❤️ for transparent and tamper-proof land registry management**
