@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Blockchain Configuration Setup
echo ========================================
echo.
echo This wizard will help you set up blockchain/.env
echo.

cd blockchain

REM Check if .env already exists
if exist .env (
    echo [WARNING] .env file already exists!
    set /p overwrite="Overwrite existing configuration? (y/N): "
    if /i not "!overwrite!"=="y" (
        echo Setup cancelled.
        pause
        exit /b 0
    )
)

echo.
echo ========================================
echo   Step 1: Get Sepolia Testnet ETH
echo ========================================
echo.
echo Visit ONE of these faucets to get FREE testnet ETH:
echo.
echo   1. Google Cloud Faucet (Recommended):
echo      https://cloud.google.com/application/web3/faucet/ethereum/sepolia
echo.
echo   2. Alchemy Faucet:
echo      https://www.alchemy.com/faucets/ethereum-sepolia
echo.
echo   3. QuickNode Faucet:
echo      https://faucet.quicknode.com/ethereum/sepolia
echo.
echo   4. Sepolia Faucet:
echo      https://sepoliafaucet.com/
echo.
echo Request 0.5 ETH to your wallet address
echo.
pause

echo.
echo ========================================
echo   Step 2: Configure RPC URL
echo ========================================
echo.
echo Default Public RPC (Recommended - No API key needed):
echo   https://ethereum-sepolia-rpc.publicnode.com
echo.
echo Or use Alchemy/Infura (Optional):
echo   Alchemy: https://www.alchemy.com/
echo   Infura: https://infura.io/
echo.
set /p use_default="Use default public RPC? (Y/n): "

if /i "%use_default%"=="n" (
    set /p rpc_url="Enter your custom Sepolia RPC URL: "
) else (
    set rpc_url=https://ethereum-sepolia-rpc.publicnode.com
    echo Using: https://ethereum-sepolia-rpc.publicnode.com
)

echo.
echo ========================================
echo   Step 3: Get Private Key
echo ========================================
echo.
echo From MetaMask:
echo   1. Click 3 dots ^> Account Details
echo   2. Show Private Key
echo   3. Enter password
echo   4. Copy the key (without 0x prefix)
echo.
echo [WARNING] Use testnet wallet only!
echo.
set /p private_key="Enter your private key (without 0x): "

echo.
echo ========================================
echo   Step 4: Etherscan API (Optional)
echo ========================================
echo.
echo Get from: https://etherscan.io/myapikey
echo (Press Enter to skip for now)
echo.
set /p etherscan_key="Enter Etherscan API key (optional): "

if "%etherscan_key%"=="" set etherscan_key=your_etherscan_api_key

REM Create .env file
echo # Blockchain Environment Variables> .env
echo.>> .env
echo # Ethereum Sepolia Testnet RPC URL>> .env
echo SEPOLIA_RPC_URL=%rpc_url%>> .env
echo.>> .env
echo # Sepolia Etherscan Explorer URL>> .env
echo SEPOLIA_EXPLORER=https://sepolia.etherscan.io/>> .env
echo.>> .env
echo # Private Key (TESTNET ONLY - NEVER commit!)>> .env
echo PRIVATE_KEY=%private_key%>> .env
echo.>> .env
echo # Etherscan API Key (for contract verification)>> .env
echo ETHERSCAN_API_KEY=%etherscan_key%>> .env
echo.>> .env
echo # Backend Operator Address (auto-filled after deployment)>> .env
echo BACKEND_OPERATOR_ADDRESS=>> .env

echo.
echo ========================================
echo   Configuration Complete!
echo ========================================
echo.
echo Created: blockchain/.env
echo.
echo Next step: Deploy to Sepolia
echo   Run: deploy-blockchain.bat
echo.
echo Or manually:
echo   cd blockchain
echo   npx hardhat run scripts/deploy.js --network sepolia
echo.

pause
