const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CitySamdhaan Smart Contracts to", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy ComplaintRegistry
  console.log("\n📄 Deploying ComplaintRegistry...");
  const ComplaintRegistry = await hre.ethers.getContractFactory("ComplaintRegistry");
  const complaintRegistry = await ComplaintRegistry.deploy();
  await complaintRegistry.waitForDeployment();
  const complaintRegistryAddress = await complaintRegistry.getAddress();
  console.log("✅ ComplaintRegistry deployed to:", complaintRegistryAddress);

  // Deploy AuditTrail
  console.log("\n📄 Deploying AuditTrail...");
  const AuditTrail = await hre.ethers.getContractFactory("AuditTrail");
  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  const auditTrailAddress = await auditTrail.getAddress();
  console.log("✅ AuditTrail deployed to:", auditTrailAddress);

  // Grant roles to backend operator (use environment variable)
  const backendOperator = process.env.BACKEND_OPERATOR_ADDRESS || deployer.address;
  console.log("\n🔐 Granting operator role to:", backendOperator);
  
  await complaintRegistry.addOperator(backendOperator);
  console.log("✅ Operator role granted for ComplaintRegistry");
  
  await auditTrail.addAuditor(backendOperator);
  console.log("✅ Auditor role granted for AuditTrail");

  // Verify deployment
  console.log("\n🔍 Verifying deployments...");
  const totalComplaints = await complaintRegistry.getTotalComplaints();
  const totalAudits = await auditTrail.getTotalAuditEntries();
  console.log("ComplaintRegistry total complaints:", totalComplaints.toString());
  console.log("AuditTrail total entries:", totalAudits.toString());

  // Save deployment info
  console.log("\n💾 Deployment Summary:");
  console.log("═══════════════════════════════════════════════");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("ComplaintRegistry:", complaintRegistryAddress);
  console.log("AuditTrail:", auditTrailAddress);
  console.log("═══════════════════════════════════════════════");
  
  console.log("\n📋 Add these to your backend .env file:");
  console.log(`BLOCKCHAIN_NETWORK=${hre.network.name}`);
  console.log(`COMPLAINT_REGISTRY_ADDRESS=${complaintRegistryAddress}`);
  console.log(`AUDIT_TRAIL_ADDRESS=${auditTrailAddress}`);
  console.log(`BLOCKCHAIN_PRIVATE_KEY=${process.env.PRIVATE_KEY ? '***HIDDEN***' : 'NOT_SET'}`);
  
  // If on testnet, show explorer links
  if (hre.network.name === 'sepolia') {
    const explorerUrl = process.env.SEPOLIA_EXPLORER || 'https://sepolia.etherscan.io/';
    console.log("\n🔗 Etherscan Links:");
    console.log(`ComplaintRegistry: ${explorerUrl}address/${complaintRegistryAddress}`);
    console.log(`AuditTrail: ${explorerUrl}address/${auditTrailAddress}`);
  }

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
