# 🚀 Sepolia Deployment - Step by Step

## Prerequisites

### 1. Get Sepolia Testnet ETH (FREE)

**Recommended: Google Cloud Faucet** ⭐
- Visit: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Sign in with your Google account
- Select "Ethereum Sepolia" network
- Enter your wallet address from MetaMask
- Request 0.5 ETH (instant delivery)

**Alternative Faucets:**
- Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia
- QuickNode: https://faucet.quicknode.com/ethereum/sepolia
- Sepolia: https://sepoliafaucet.com/

**How much?** Request 0.5 ETH (enough for ~100 deployments)

### 2. Get RPC URL (FREE)

**Option A: Alchemy (Recommended)**
1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create new app → Select "Ethereum" → "Sepolia"
4. Copy the HTTPS URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`)

**Option B: Infura**
1. Go to https://infura.io/
2. Sign up (free)
3. Create new API key → Enable Sepolia
4. Copy the URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 3. Get Your Private Key

**From MetaMask:**
1. Open MetaMask → Click 3 dots → Account Details
2. Click "Show Private Key"
3. Enter password
4. Copy the private key (64 characters, no 0x prefix)

⚠️ **SECURITY WARNING**: This is testnet only! Never use mainnet private key!

## Deployment Steps

### Step 1: Create .env File

```bash
cd blockchain
```

Create `.env` file (copy from `.env.example`):

```env
# Replace these with your actual values:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_64_character_private_key_without_0x
ETHERSCAN_API_KEY=optional_for_now
```

### Step 2: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

You'll see output like:
```
🚀 Deploying CitySamdhaan Smart Contracts to sepolia
📝 Deploying with account: 0xYourAddress
💰 Account balance: 0.5 ETH

📄 Deploying ComplaintRegistry...
✅ ComplaintRegistry deployed to: 0x123abc...

📄 Deploying AuditTrail...
✅ AuditTrail deployed to: 0x456def...

🔐 Granting operator role to: 0xYourAddress
✅ Operator role granted for ComplaintRegistry
✅ Auditor role granted for AuditTrail

💾 Deployment Summary:
════════════════════════════════════════════════
Network: sepolia
Deployer: 0xYourAddress
ComplaintRegistry: 0x123abc...
AuditTrail: 0x456def...
════════════════════════════════════════════════

📋 Add these to your backend .env file:
BLOCKCHAIN_NETWORK=sepolia
COMPLAINT_REGISTRY_ADDRESS=0x123abc...
AUDIT_TRAIL_ADDRESS=0x456def...
```

### Step 3: Update Backend Configuration

Add to `backend/.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=your_private_key
COMPLAINT_REGISTRY_ADDRESS=0x123abc... # From deployment output
AUDIT_TRAIL_ADDRESS=0x456def... # From deployment output
```

### Step 4: Update Frontend Configuration

Add to `frontend/.env`:

```env
VITE_BLOCKCHAIN_NETWORK=sepolia
VITE_COMPLAINT_REGISTRY_ADDRESS=0x123abc...
VITE_AUDIT_TRAIL_ADDRESS=0x456def...
```

### Step 5: Verify Deployment

Visit Etherscan:
- ComplaintRegistry: `https://sepolia.etherscan.io/address/0x123abc...`
- AuditTrail: `https://sepolia.etherscan.io/address/0x456def...`

You should see your deployed contracts!

### Step 6: Start Backend

```bash
cd backend
npm run dev
```

Look for:
```
✅ Blockchain Service Connected
📊 Blockchain Stats: 0 complaints, 0 audits on block 12345
```

## Troubleshooting

### Error: "Insufficient funds"
**Cause**: Not enough Sepolia ETH  
**Fix**: Get more from faucets above

### Error: "Invalid API Key"
**Cause**: Wrong RPC URL or expired key  
**Fix**: Double-check Alchemy/Infura dashboard

### Error: "Network timeout"
**Cause**: RPC provider down or rate limited  
**Fix**: Try different RPC provider or wait

### Error: "Nonce too high"
**Cause**: Transaction queue issue  
**Fix**: Reset MetaMask account or wait 5 minutes

## Post-Deployment

### Test Complaint Registration

1. Start backend: `cd backend && npm run dev`
2. Create a complaint via API or frontend
3. Check backend logs for: `✅ Complaint CSB-2024-001 anchored on blockchain: 0xtxhash...`
4. Visit Etherscan to see transaction!

### View on Etherscan

Your contracts are now live and public:
- View all transactions
- See complaint registrations
- Audit trail entries
- Full transparency!

## Quick Commands Reference

```bash
# Check deployment status
npx hardhat console --network sepolia
> const registry = await ethers.getContractAt("ComplaintRegistry", "0xYourAddress")
> await registry.getTotalComplaints()

# Re-deploy if needed
npx hardhat run scripts/deploy.js --network sepolia

# Clean and rebuild
npx hardhat clean
npx hardhat compile
```

## Cost Estimation

Deployment costs (one-time):
- ComplaintRegistry: ~$2-3 USD
- AuditTrail: ~$2-3 USD
- Total: ~$5 USD (on Sepolia: **FREE** with testnet ETH!)

Operational costs per complaint:
- Register: ~$0.15
- Status Update: ~$0.08
- Audit Entry: ~$0.07

## Security Checklist

- [x] Using testnet (Sepolia) ✅
- [ ] .env file in .gitignore
- [ ] Private key NOT committed to Git
- [ ] Different key for mainnet (when ready)
- [ ] Etherscan verification enabled

## Next Steps

1. ✅ Deploy to Sepolia
2. ✅ Configure backend
3. ✅ Test complaint registration
4. ✅ Verify on Etherscan
5. 📊 Monitor gas usage
6. 🔄 Test with multiple complaints
7. 📱 Add to frontend UI
8. 🎯 Production planning

---

**Need Help?** 
- Alchemy Discord: https://discord.gg/alchemy
- Hardhat Discord: https://discord.gg/hardhat
- Stack Overflow: ethereum, solidity, hardhat tags

**Status**: Ready to deploy! 🚀
