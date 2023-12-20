const hre = require("hardhat");

let contractName = "Bank"

async function main() {
  const contract = await hre.ethers.deployContract(contractName);
  await contract.waitForDeployment();
  console.log(
      `${contractName} deployed to ${contract.target}`
  );
}
 
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
