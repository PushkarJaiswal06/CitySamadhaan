# ⚡ INSTANT DEPLOY - No API Keys Needed!

## 🎯 Using Public Sepolia RPC (No Signup Required!)

Your blockchain configuration is already set up with:
- **RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com` (Public, free, no API key!)
- **Explorer**: `https://sepolia.etherscan.io/`

## 🚀 Deploy in 3 Steps

### Step 1: Get Testnet ETH (2 minutes)

**Option 1 - Google Cloud (Easiest)** ⭐
Visit: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Sign in with Google account
- Select Ethereum Sepolia
- Enter your wallet address
- Get 0.5 ETH instantly

**Option 2 - Other Faucets:**
- Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia
- QuickNode: https://faucet.quicknode.com/ethereum/sepolia
- Sepolia: https://sepoliafaucet.com/

### Step 2: Add Your Private Key (1 minute)
Edit `blockchain/.env`:
```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SEPOLIA_EXPLORER=https://sepolia.etherscan.io/
PRIVATE_KEY=your_private_key_here_without_0x  # 👈 Change this
```

**Get Private Key from MetaMask:**
1. Click 3 dots → Account Details
2. Show Private Key → Enter password
3. Copy (64 characters, no "0x")

### Step 3: Deploy! (1 minute)
```bash
deploy-blockchain.bat
```

## That's It! 🎉

No Alchemy signup needed!
No Infura account required!
No API keys to manage!

Just:
1. ✅ Testnet ETH from faucet
2. ✅ Your private key
3. ✅ Run deploy script

## After Deployment

Copy contract addresses to `backend/.env`:
```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
BLOCKCHAIN_EXPLORER_URL=https://sepolia.etherscan.io/
BLOCKCHAIN_PRIVATE_KEY=your_private_key
COMPLAINT_REGISTRY_ADDRESS=0xYOUR_ADDRESS_FROM_DEPLOYMENT
AUDIT_TRAIL_ADDRESS=0xYOUR_ADDRESS_FROM_DEPLOYMENT
```

Start backend:
```bash
cd backend
npm run dev
```

Look for: `✅ Blockchain Service Connected`

## View Your Contracts

Visit: https://sepolia.etherscan.io/
Search for your contract addresses!

---

**Total Time**: ~4 minutes ⚡
**Cost**: FREE
**API Keys Needed**: ZERO 🎯
