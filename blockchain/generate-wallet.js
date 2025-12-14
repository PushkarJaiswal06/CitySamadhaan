const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('   Ethereum Wallet Generator');
console.log('========================================\n');

// Generate a random wallet
const wallet = ethers.Wallet.createRandom();

console.log('✅ New wallet generated!\n');
console.log('📋 Wallet Details:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Public Address (Share this to receive ETH):');
console.log(wallet.address);
console.log('');

console.log('Private Key (KEEP THIS SECRET - Never share!):');
console.log(wallet.privateKey);
console.log('');

console.log('Private Key (without 0x prefix for .env):');
console.log(wallet.privateKey.slice(2));
console.log('');

console.log('Mnemonic Phrase (Backup - 12 words):');
console.log(wallet.mnemonic.phrase);
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Save to file
const walletInfo = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  privateKeyWithout0x: wallet.privateKey.slice(2),
  mnemonic: wallet.mnemonic.phrase,
  createdAt: new Date().toISOString()
};

const filename = `wallet-${Date.now()}.json`;
const filepath = path.join(__dirname, filename);

fs.writeFileSync(filepath, JSON.stringify(walletInfo, null, 2));

console.log('💾 Wallet saved to:', filename);
console.log('');

console.log('⚠️  SECURITY WARNING:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. NEVER share your private key with anyone!');
console.log('2. This wallet is for TESTNET ONLY');
console.log('3. Write down your mnemonic phrase and store safely');
console.log('4. Delete the JSON file after copying the details');
console.log('5. Do NOT use this wallet for mainnet/real funds');
console.log('');

console.log('📝 Next Steps:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Copy your ADDRESS and get testnet ETH from:');
console.log('   https://cloud.google.com/application/web3/faucet/ethereum/sepolia');
console.log('');
console.log('2. Copy PRIVATE KEY (without 0x) to blockchain/.env:');
console.log('   PRIVATE_KEY=' + wallet.privateKey.slice(2));
console.log('');
console.log('3. Import to MetaMask (optional):');
console.log('   - Open MetaMask');
console.log('   - Click "Import Account"');
console.log('   - Paste private key or use mnemonic');
console.log('');
console.log('4. Deploy blockchain:');
console.log('   deploy-blockchain.bat');
console.log('');
console.log('========================================\n');
