const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying LandRegistry contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy LandRegistry contract
  console.log("📋 Deploying LandRegistry...");
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();

  const landRegistryAddress = await landRegistry.getAddress();
  console.log("✅ LandRegistry deployed to:", landRegistryAddress);
  console.log("");

  // Add some authorized verifiers (optional, for testing)
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("🔧 Setting up test verifiers...");
    
    const accounts = await hre.ethers.getSigners();
    
    if (accounts.length > 1) {
      // Add surveyor
      await landRegistry.addVerifier(accounts[1].address, "surveyor");
      console.log("   Added surveyor:", accounts[1].address);
      
      // Add sub-registrar
      if (accounts.length > 2) {
        await landRegistry.addVerifier(accounts[2].address, "sub_registrar");
        console.log("   Added sub-registrar:", accounts[2].address);
      }
      
      // Add tehsildar
      if (accounts.length > 3) {
        await landRegistry.addVerifier(accounts[3].address, "tehsildar");
        console.log("   Added tehsildar:", accounts[3].address);
      }
    }
    console.log("");
  }

  // Save deployment address
  const deploymentInfo = {
    network: hre.network.name,
    landRegistry: landRegistryAddress,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentPath = path.join(__dirname, "../deployment-address.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log("");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("📝 To verify contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${landRegistryAddress}`);
    console.log("");
  }

  // Get contract stats
  const totalProperties = await landRegistry.getTotalProperties();
  console.log("📊 Contract Stats:");
  console.log("   Total Properties:", totalProperties.toString());
  console.log("   Admin:", await landRegistry.admin());
  console.log("");

  console.log("✅ Deployment complete!");
  console.log("");
  console.log("🔐 Don't forget to:");
  console.log("   1. Add BLOCKCHAIN_RPC_URL to backend .env");
  console.log("   2. Add BLOCKCHAIN_PRIVATE_KEY to backend .env");
  console.log("   3. Update deployment-address.json if deploying to different network");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
