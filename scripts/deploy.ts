import { ethers } from "hardhat";
import { FTX } from "../typechain-types";

const hre = require("hardhat");

async function main() {
    const deployerFactory = await ethers.getContractFactory("contracts/result.sol:FTX");
    deployerFactory.deploy("0x767E095f6549050b4e9A3BccE18AadD28beF486f");   
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
