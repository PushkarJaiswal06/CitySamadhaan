# 🔗 CitySamdhaan Blockchain Integration Guide

## Overview

CitySamdhaan uses Ethereum blockchain to create an **immutable, transparent audit trail** for all civic complaints and system actions. This ensures accountability and prevents data tampering.

## Architecture

### Smart Contracts

1. **ComplaintRegistry.sol**
   - Registers all complaints on-chain
   - Records status updates immutably
   - Maintains complete audit history
   - Enables data integrity verification

2. **AuditTrail.sol**
   - Records all system actions
   - Creates blockchain-within-blockchain integrity chain
   - Tracks user operations, permissions, system changes
   - Enables forensic auditing

### Network Configuration

- **Development**: Local Hardhat Network (localhost:8545)
- **Testing**: Ethereum Sepolia Testnet
- **Production**: Ethereum Mainnet (future)

## Setup Instructions

### 1. Install Dependencies

```bash
cd blockchain
npm install
```

### 2. Configure Environment

Create `blockchain/.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
BACKEND_OPERATOR_ADDRESS=wallet_address_for_backend_operations
```

**Get Infura Key**: https://infura.io/ (Free tier available)
**Get Testnet ETH**: https://sepoliafaucet.com/

### 3. Compile Smart Contracts

```bash
cd blockchain
npx hardhat compile
```

### 4. Deploy to Local Network

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 6. Configure Backend

Add to `backend/.env`:

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BLOCKCHAIN_PRIVATE_KEY=your_private_key
COMPLAINT_REGISTRY_ADDRESS=<address_from_deployment>
AUDIT_TRAIL_ADDRESS=<address_from_deployment>
```

### 7. Configure Frontend

Add to `frontend/.env`:

```env
VITE_BLOCKCHAIN_NETWORK=sepolia
VITE_COMPLAINT_REGISTRY_ADDRESS=<address_from_deployment>
VITE_AUDIT_TRAIL_ADDRESS=<address_from_deployment>
```

## How It Works

### Complaint Registration Flow

1. **User submits complaint** → Saved to MongoDB
2. **Backend hashes complaint data** → Creates SHA256 hash
3. **Calls ComplaintRegistry.registerComplaint()** → Anchored on-chain
4. **Transaction confirmed** → Hash stored in MongoDB
5. **User sees blockchain badge** → Can verify on Etherscan

### Status Update Flow

1. **Officer updates status** → MongoDB updated
2. **Backend calls ComplaintRegistry.updateStatus()** → On-chain record
3. **AuditTrail.recordAudit()** → Action recorded
4. **Full history preserved** → Immutable audit trail

### Verification Flow

1. **User clicks "Verify"** → Request to backend
2. **Backend retrieves complaint** → Generates current hash
3. **Calls ComplaintRegistry.verifyComplaint()** → Compares hashes
4. **Returns verification result** → Match = verified, mismatch = tampered

## Smart Contract Functions

### ComplaintRegistry

```solidity
// Register new complaint
function registerComplaint(
    string memory _complaintId,
    bytes32 _dataHash,
    address _citizen,
    string memory _department
) public onlyOperator

// Update complaint status
function updateStatus(
    string memory _complaintId,
    string memory _newStatus,
    bytes32 _updateHash,
    string memory _comment
) public onlyOperator

// Verify complaint integrity
function verifyComplaint(
    string memory _complaintId,
    bytes32 _dataHash
) public view returns (bool)

// Get status history
function getStatusHistory(string memory _complaintId) 
    public view returns (StatusUpdate[] memory)
```

### AuditTrail

```solidity
// Record audit entry
function recordAudit(
    ActionType _actionType,
    string memory _entityId,
    bytes32 _dataHash,
    string memory _description
) public onlyAuditor

// Verify chain integrity
function verifyChainIntegrity(uint256 _entryId) 
    public view returns (bool)
```

## API Integration

### Backend Blockchain Service

```javascript
import blockchainService from './services/blockchainService.js';

// Register complaint
const blockchainData = await blockchainService.registerComplaint({
  complaintId: complaint.complaintId,
  citizen: userId,
  title: complaint.title,
  description: complaint.description,
  department: dept.code
});

// Update status
await blockchainService.updateComplaintStatus(
  complaint.complaintId,
  { status: 'resolved', comment: 'Fixed' }
);

// Record audit
await blockchainService.recordAudit({
  actionType: 'COMPLAINT_UPDATED',
  entityId: complaint.complaintId,
  description: 'Status changed by officer'
});

// Verify complaint
const result = await blockchainService.verifyComplaint(
  complaint.complaintId,
  complaintData
);
```

### Frontend Component

```jsx
import BlockchainVerification from './components/BlockchainVerification';

<BlockchainVerification complaint={complaint} />
```

## Gas Optimization

### Estimated Gas Costs (Sepolia)

| Operation | Gas Used | Cost @ 50 Gwei |
|-----------|----------|----------------|
| Register Complaint | ~150,000 | $0.15 |
| Update Status | ~80,000 | $0.08 |
| Record Audit | ~70,000 | $0.07 |

### Optimization Strategies

1. **Batch Operations**: Group multiple updates
2. **Data Compression**: Store only critical hashes
3. **Off-chain Storage**: Use IPFS for large data
4. **Layer 2**: Consider Polygon/Arbitrum for production

## Security Considerations

### Access Control

- **ADMIN_ROLE**: Contract owner, manages roles
- **OPERATOR_ROLE**: Backend service, registers complaints
- **AUDITOR_ROLE**: Backend service, records audits

### Private Key Security

```bash
# NEVER commit .env files
echo "blockchain/.env" >> .gitignore
echo "backend/.env" >> .gitignore

# Use environment variables in production
export BLOCKCHAIN_PRIVATE_KEY="..."
```

### Circuit Breakers

Both contracts have `pause()` functionality:

```javascript
// Emergency stop
await complaintRegistry.pause();

// Resume
await complaintRegistry.unpause();
```

## Monitoring & Verification

### View on Etherscan

```
Sepolia: https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
Mainnet: https://etherscan.io/address/{CONTRACT_ADDRESS}
```

### Query Blockchain Data

```bash
# Get total complaints
npx hardhat console --network sepolia
> const ComplaintRegistry = await ethers.getContractAt("ComplaintRegistry", "0x...")
> await ComplaintRegistry.getTotalComplaints()

# Get complaint
> await ComplaintRegistry.getComplaint("CSB-2024-001")
```

## Troubleshooting

### Issue: Transaction fails with "out of gas"

**Solution**: Increase gas limit in hardhat.config.js

```javascript
networks: {
  sepolia: {
    gas: 3000000,
    gasPrice: 50000000000 // 50 Gwei
  }
}
```

### Issue: "Insufficient funds for gas"

**Solution**: Get testnet ETH from faucet
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### Issue: Backend can't connect to blockchain

**Solution**: Check RPC URL and network
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.infura.io/v3/YOUR_KEY
```

## Testing

### Run Contract Tests

```bash
cd blockchain
npx hardhat test
```

### Test Backend Integration

```bash
cd backend
npm test -- blockchain.test.js
```

## Production Deployment

### Mainnet Checklist

- [ ] Audit smart contracts (OpenZeppelin, ConsenSys Diligence)
- [ ] Use multisig wallet for admin operations
- [ ] Set up monitoring (The Graph, Tenderly)
- [ ] Configure gas price strategies
- [ ] Set up hot/cold wallet separation
- [ ] Enable contract verification on Etherscan
- [ ] Implement rate limiting for blockchain operations
- [ ] Set up backup RPC providers

### Cost Estimation

Assuming 1000 complaints/day:
- Registration: 1000 × $0.15 = $150/day
- Updates (avg 3/complaint): 3000 × $0.08 = $240/day
- **Total**: ~$390/day on Ethereum mainnet

**Recommendation**: Use Polygon zkEVM or Arbitrum to reduce costs by 100x

## Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Ethers.js**: https://docs.ethers.org/
- **Ethereum**: https://ethereum.org/developers

## Support

For blockchain-related issues:
1. Check contract events on Etherscan
2. Review backend logs for transaction errors
3. Verify RPC endpoint connectivity
4. Ensure sufficient ETH balance for gas

---

**Status**: ✅ Fully integrated and operational
**Network**: Sepolia Testnet
**Contracts Verified**: Yes
**Last Updated**: December 2024
