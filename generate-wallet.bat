@echo off
echo.
echo ========================================
echo   Generating New Ethereum Wallet
echo ========================================
echo.

cd blockchain

node generate-wallet.js

echo.
echo Press any key to close...
pause > nul
