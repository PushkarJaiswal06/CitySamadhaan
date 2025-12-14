# 🚀 Blockchain Deployment Checklist

## Pre-Deployment (5 minutes)

### ✅ Step 1: Get Testnet ETH
- [ ] Visit Google Cloud faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- [ ] Sign in with Google account
- [ ] Select Ethereum Sepolia network
- [ ] Enter your MetaMask wallet address
- [ ] Request 0.5 Sepolia ETH
- [ ] Wait for confirmation (~30 seconds)

**Alternative faucets if Google doesn't work:**
- Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia
- QuickNode: https://faucet.quicknode.com/ethereum/sepolia
- Sepolia: https://sepoliafaucet.com/

### ✅ Step 2: Get RPC Provider (Choose ONE)

**Option A: Alchemy** ⭐ Recommended
- [ ] Sign up: https://www.alchemy.com/
- [ ] Create app: Ethereum → Sepolia
- [ ] Copy HTTPS URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

**Option B: Infura**
- [ ] Sign up: https://infura.io/
- [ ] Create project → Enable Sepolia
- [ ] Copy URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### ✅ Step 3: Get Private Key
- [ ] Open MetaMask
- [ ] Account Details → Show Private Key
- [ ] Copy key (64 characters, WITHOUT "0x")
- [ ] ⚠️ Use TESTNET wallet only!

### ✅ Step 4: Configure Environment

**Quick Setup (Recommended):**
```bash
# Run interactive setup wizard
setup-blockchain.bat  # Windows
# OR
./setup-blockchain.sh  # Mac/Linux
```

**Manual Setup:**
```bash
cd blockchain
cp .env.example .env
# Edit .env with your values
```

Your `blockchain/.env` should look like:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123def456...
PRIVATE_KEY=1234567890abcdef...  # 64 characters, no 0x
ETHERSCAN_API_KEY=optional_for_now
```

## Deployment (2 minutes)

### ✅ Step 5: Deploy Contracts

**Quick Deploy (Recommended):**
```bash
# Run automated deployment
deploy-blockchain.bat  # Windows
# OR
./deploy-blockchain.sh  # Mac/Linux
```

**Manual Deploy:**
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### ✅ Step 6: Copy Contract Addresses

From deployment output, copy these addresses:
```
ComplaintRegistry: 0x123abc...
AuditTrail: 0x456def...
```

## Backend Configuration (1 minute)

### ✅ Step 7: Update Backend .env

Add to `backend/.env`:
```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=your_64_char_private_key
COMPLAINT_REGISTRY_ADDRESS=0x123abc...  # From deployment
AUDIT_TRAIL_ADDRESS=0x456def...         # From deployment
```

### ✅ Step 8: Update Frontend .env

Add to `frontend/.env`:
```env
VITE_BLOCKCHAIN_NETWORK=sepolia
VITE_COMPLAINT_REGISTRY_ADDRESS=0x123abc...
VITE_AUDIT_TRAIL_ADDRESS=0x456def...
```

## Verification (1 minute)

### ✅ Step 9: Verify on Etherscan

- [ ] Visit: https://sepolia.etherscan.io/
- [ ] Search for your contract addresses
- [ ] Verify you see deployment transactions
- [ ] Bookmark contract URLs

### ✅ Step 10: Test Backend Connection

```bash
cd backend
npm run dev
```

Look for these logs:
```
✅ MongoDB Connected
✅ Redis Connected
✅ Blockchain Service Connected
📊 Blockchain Stats: 0 complaints, 0 audits on block 12345
🚀 Server running on port 5000
```

### ✅ Step 11: Test First Complaint

1. **Create complaint via API or frontend**
2. **Check backend logs:**
   ```
   ✅ Complaint CSB-2024-001 anchored on blockchain: 0xtxhash...
   ```
3. **Visit Etherscan to see your transaction!**
   - Search for transaction hash
   - View complaint registration
   - See all the data on-chain

## Post-Deployment

### ✅ Step 12: Update Documentation

- [ ] Add contract addresses to DEPLOYMENT-CHECKLIST.md
- [ ] Update team with Etherscan links
- [ ] Document gas usage for future reference

### ✅ Step 13: Security Check

- [ ] Verify `.env` files NOT in Git
- [ ] Check `.gitignore` includes:
  ```
  blockchain/.env
  backend/.env
  frontend/.env.local
  ```
- [ ] Confirm using testnet private key only
- [ ] Different key prepared for mainnet (future)

### ✅ Step 14: Monitoring Setup

- [ ] Bookmark Etherscan contract pages
- [ ] Set up gas price alerts (optional)
- [ ] Monitor transaction success rate
- [ ] Track complaint anchoring stats

## Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution:** Get more testnet ETH from faucet

### Issue: "Network request failed"
**Solution:** Check RPC URL, try different provider

### Issue: "Invalid private key"
**Solution:** Verify 64 characters, no 0x prefix, no spaces

### Issue: "Contract deployment failed"
**Solution:** Check network connectivity, increase gas limit

### Issue: Backend can't connect to blockchain
**Solution:** Verify contract addresses in backend/.env

## Quick Reference

### Contract Addresses (Fill after deployment)
```
ComplaintRegistry: 0x________________
AuditTrail:        0x________________
Deployed By:       0x________________
Deployment TX:     0x________________
Block Number:      __________
Deployment Date:   __________
```

### Useful Links
- **Etherscan**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://infura.io/

### Commands
```bash
# Re-compile
npx hardhat clean && npx hardhat compile

# Re-deploy
npx hardhat run scripts/deploy.js --network sepolia

# Check contract
npx hardhat console --network sepolia

# View logs
npx hardhat node  # Local testing
```

## Success Criteria

Your deployment is successful when:
- ✅ Contracts visible on Sepolia Etherscan
- ✅ Backend connects without errors
- ✅ First complaint anchored on blockchain
- ✅ Transaction hash visible in backend logs
- ✅ Blockchain badge shows on frontend
- ✅ "View on Etherscan" link works

## Time Estimate

- Pre-deployment setup: 5 minutes
- Deployment: 2 minutes
- Configuration: 2 minutes
- Testing: 2 minutes
- **Total: ~11 minutes** ⚡

## Support

Need help?
1. Check [SEPOLIA-DEPLOYMENT.md](SEPOLIA-DEPLOYMENT.md)
2. Check [BLOCKCHAIN-GUIDE.md](BLOCKCHAIN-GUIDE.md)
3. Review [BLOCKCHAIN-QUICKSTART.md](BLOCKCHAIN-QUICKSTART.md)

---

**Status**: Ready to deploy! 🎯
**Network**: Sepolia Testnet
**Cost**: FREE (testnet ETH)
**Time**: ~11 minutes
