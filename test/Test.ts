import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { FTXDeployer } from "../typechain-types";
import { INonfungiblePositionManager } from "../typechain-types/contracts/result.sol";
import { token } from "../typechain-types/@openzeppelin/contracts";

  describe("Deployment", function () {
    it("Deploy", async function () {
      const SUPPLY = await ethers.parseEther("1100000000");
      const daoOwnerAddress = "0x7798Ba9512B5A684C12e31518923Ea4221A41Fb9";     
      const deployer: FTXDeployer = await ethers.deployContract("FTXDeployer");
      const treasury = await ethers.getContractAt("DaoTreasury", "0x767E095f6549050b4e9A3BccE18AadD28beF486f");
      const treasuryAddress = await treasury.getAddress();
      
      console.log("Deployer address", await deployer.getAddress())
      console.log("Treasury address", await treasuryAddress)

      
      // const daoOwnerAddress = await treasury.getAddress();

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [daoOwnerAddress],
      });
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [treasuryAddress],
      });
      const daoOwner = await ethers.getSigner(daoOwnerAddress);
      console.log("Fake treasury owner address:", await daoOwner.getAddress())

      let ABI = ["function deploy()"]
      const calldata_deploy = new ethers.Interface(ABI).encodeFunctionData("deploy", []);      

      
      const responseDeploy = await treasury.connect(daoOwner).execute(
        [await deployer.getAddress()], 
        [calldata_deploy], 
        [0],
        {
          gasLimit: 6_216_025 
        }
      );

      const ABI_LP = ["function createLPPool(int24 initialTick, int24 upperTick)"];
      const calldata_createLP = new ethers.Interface(ABI_LP).encodeFunctionData("createLPPool", [-178200, 887200]);

      console.log(calldata_createLP)
      const responseCreateLPPool = await treasury.connect(daoOwner).execute(
        [await deployer.tokenAddress()], 
        [calldata_createLP], 
        [0],
        {
          gasLimit: 7_000_000 
        }
      );



    });

  });



// deploy ERC20 through the DAO
// daoTreasury -> fundraising, sending out tokens to everyone....
// execute() -> DAO manager to execute any function call
// task -> create a ERC20 through this execute interface, and create a UniswapV3 LP with this newly created token / Alameda Research V2 ERC20 token
// 1% fee
// deploy script so that the whole thing gets deployed


