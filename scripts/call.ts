import { ethers } from "hardhat";
import { FTX } from "../typechain-types";

const hre = require("hardhat");

async function main() {
    const token = await ethers.getContractAt("FTX", "0x31264a10B9925266363066f370E6D8F90e7Dea92");
    const result = await token.createLPPool(200, 400);
    console.log(result);   
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
