# 🎯 DEPLOY NOW - Quick Commands

## Option 1: Automated Deployment (Easiest) ⭐

```bash
# Step 1: Setup configuration (interactive wizard)
setup-blockchain.bat

# Step 2: Deploy to Sepolia
deploy-blockchain.bat

# Done! Copy contract addresses to backend/.env
```

## Option 2: Manual Deployment

### Step 1: Configure blockchain/.env

```bash
cd blockchain
```

Create `.env` file:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=optional
```

### Step 2: Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 3: Configure Backend

Add to `backend/.env`:
```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=your_private_key
COMPLAINT_REGISTRY_ADDRESS=0xYOUR_COMPLAINT_REGISTRY
AUDIT_TRAIL_ADDRESS=0xYOUR_AUDIT_TRAIL
```

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

Look for: `✅ Blockchain Service Connected`

## What You Need (5 minutes to get)

1. **Testnet ETH**: https://sepoliafaucet.com/ (FREE)
2. **RPC URL**: https://www.alchemy.com/ (FREE signup)
3. **Private Key**: From MetaMask (testnet wallet)

## After Deployment

✅ View contracts: https://sepolia.etherscan.io/
✅ Create complaint → See blockchain anchoring in logs
✅ Check transaction on Etherscan

## Need Help?

- Full guide: [SEPOLIA-DEPLOYMENT.md](SEPOLIA-DEPLOYMENT.md)
- Checklist: [BLOCKCHAIN-DEPLOYMENT-CHECKLIST.md](BLOCKCHAIN-DEPLOYMENT-CHECKLIST.md)
- Architecture: [BLOCKCHAIN-GUIDE.md](BLOCKCHAIN-GUIDE.md)

---

**Ready?** Run `setup-blockchain.bat` now! 🚀
