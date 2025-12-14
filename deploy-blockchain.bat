@echo off
echo.
echo ========================================
echo   CitySamdhaan Blockchain Deployment
echo ========================================
echo.

cd blockchain

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create blockchain/.env file with:
    echo   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
    echo   PRIVATE_KEY=your_private_key_without_0x
    echo.
    echo See SEPOLIA-DEPLOYMENT.md for detailed instructions
    pause
    exit /b 1
)

echo [1/3] Checking environment...
call npx hardhat --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Hardhat not installed. Run: npm install
    pause
    exit /b 1
)
echo     - Hardhat: OK

echo.
echo [2/3] Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying to Sepolia testnet...
echo.
echo This will take 30-60 seconds. Please wait...
echo.

call npx hardhat run scripts/deploy.js --network sepolia

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deployment failed!
    echo.
    echo Common issues:
    echo   1. Insufficient testnet ETH - Get from:
    echo      https://cloud.google.com/application/web3/faucet/ethereum/sepolia
    echo   2. Invalid RPC URL - Check your RPC endpoint
    echo   3. Wrong private key - Verify in .env file
    echo.
    echo See SEPOLIA-DEPLOYMENT.md for troubleshooting
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Copy contract addresses from output above
echo   2. Add to backend/.env file:
echo      BLOCKCHAIN_ENABLED=true
echo      BLOCKCHAIN_NETWORK=sepolia
echo      BLOCKCHAIN_RPC_URL=your_rpc_url
echo      BLOCKCHAIN_PRIVATE_KEY=your_private_key
echo      COMPLAINT_REGISTRY_ADDRESS=address_from_output
echo      AUDIT_TRAIL_ADDRESS=address_from_output
echo.
echo   3. Start backend: cd backend ^&^& npm run dev
echo.
echo View contracts on Etherscan:
echo   https://sepolia.etherscan.io/
echo.

pause
