#!/bin/bash

echo ""
echo "========================================"
echo "  CitySamdhaan Blockchain Deployment"
echo "========================================"
echo ""

cd blockchain

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo ""
    echo "Please create blockchain/.env file with:"
    echo "  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
    echo "  PRIVATE_KEY=your_private_key_without_0x"
    echo ""
    echo "See SEPOLIA-DEPLOYMENT.md for detailed instructions"
    exit 1
fi

echo "[1/3] Checking environment..."
if ! command -v npx &> /dev/null; then
    echo "[ERROR] Node.js/npm not installed!"
    exit 1
fi
echo "    ✓ Node.js: OK"

echo ""
echo "[2/3] Compiling contracts..."
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed!"
    exit 1
fi

echo ""
echo "[3/3] Deploying to Sepolia testnet..."
echo ""
echo "This will take 30-60 seconds. Please wait..."
echo ""

npx hardhat run scripts/deploy.js --network sepolia

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  1. Insufficient testnet ETH - Get from https://sepoliafaucet.com/"
    echo "  2. Invalid RPC URL - Check your Alchemy/Infura key"
    echo "  3. Wrong private key - Verify in .env file"
    echo ""
    echo "See SEPOLIA-DEPLOYMENT.md for troubleshooting"
    exit 1
fi

echo ""
echo "========================================"
echo "  Deployment Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "  1. Copy contract addresses from output above"
echo "  2. Add to backend/.env file:"
echo "     BLOCKCHAIN_ENABLED=true"
echo "     BLOCKCHAIN_NETWORK=sepolia"
echo "     BLOCKCHAIN_RPC_URL=your_rpc_url"
echo "     BLOCKCHAIN_PRIVATE_KEY=your_private_key"
echo "     COMPLAINT_REGISTRY_ADDRESS=address_from_output"
echo "     AUDIT_TRAIL_ADDRESS=address_from_output"
echo ""
echo "  3. Start backend: cd backend && npm run dev"
echo ""
echo "View contracts on Etherscan:"
echo "  https://sepolia.etherscan.io/"
echo ""
