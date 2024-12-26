import { ethers } from "hardhat";
import { FTX, FTXDeployer } from "../typechain-types";

const hre = require("hardhat");

async function main() {
  const signer = (await ethers.getSigners())[0]; // daoOwner
  // const daoOwnerAddress = "0x7798Ba9512B5A684C12e31518923Ea4221A41Fb9";     
  
  const treasuryAddress = "<INSERT_YOUR_ADDRESS_HERE>";
  const treasury = await ethers.getContractAt("DaoTreasury", treasuryAddress);
  console.log("Treasury address", await treasury.getAddress());

  const deployer: FTXDeployer = await ethers.deployContract("FTXDeployer", signer);
  const deployerAddress: string = await deployer.getAddress();
  console.log("Deployed the deployer contract!");
  console.log("Deployer address", deployerAddress);


  // await deployer.deploy();
  let ABI = ["function deploy()"]
  const calldata_deploy = new ethers.Interface(ABI).encodeFunctionData("deploy", []);      

  await treasury.connect(signer).execute(
    [await deployer.getAddress()], 
    [calldata_deploy], 
    [0],
    {
      gasLimit: 3_000_000,
    }
  );

  console.log(`Deployed the FTX contract at address ${await deployer.tokenAddress()}!`);

  const ABI_LP = ["function createLPPool(int24 initialTick, int24 upperTick)"];
  const calldata_createLP = new ethers.Interface(ABI_LP).encodeFunctionData("createLPPool", [0, 887200]);

  await treasury.connect(signer).execute(
    [await deployer.tokenAddress()], 
    [calldata_createLP], 
    [0],
    {
      gasLimit: 6_000_000
    }
  );

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
