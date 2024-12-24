import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { FTXDeployer } from "../typechain-types";

  describe("Deployment", function () {
    it("Deploy", async function () {

      const daoOwnerAddress = "0x7798Ba9512B5A684C12e31518923Ea4221A41Fb9";     
      const deployer: FTXDeployer = await ethers.deployContract("FTXDeployer");
      const treasury = await ethers.getContractAt("DaoTreasury", "0x767E095f6549050b4e9A3BccE18AadD28beF486f");
      
      console.log("Deployer address", await deployer.getAddress())
      console.log("Treasury address", await treasury.getAddress())

      
      // const daoOwnerAddress = await treasury.getAddress();

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [daoOwnerAddress],
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

      // console.log(responseDeploy)
      console.log("FTX deployed token address:", await deployer.tokenAddress());
      

      // faking the sender to show error if one pops up (.call eats it)
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [await treasury.getAddress()],
      });
      const treasuryAccount = await ethers.getSigner(await treasury.getAddress());
      
      const FTX = await ethers.getContractAt("FTX", await deployer.tokenAddress());
      
      // await FTX.connect(treasuryAccount).approve(await FTX.POSITION_MANAGER(), await FTX.SUPPLY() / BigInt(2));
      const response_lp = await FTX.connect(treasuryAccount).createLPPool(200, 400);
      console.log(response_lp)

      // const ABI_LP = ["function createLPPool(int24 initialTick, int24 upperTick)"];
      // const calldata_createLP = new ethers.Interface(ABI_LP).encodeFunctionData("createLPPool", [-178200, 887200]);

      // console.log(calldata_createLP)
      // const responseCreateLPPool = await treasury.connect(daoOwner).execute(
      //   [await deployer.tokenAddress()], 
      //   [calldata_createLP], 
      //   [0],
      //   {
      //     gasLimit: 7_000_000 
      //   }
      // );



    });

  });

