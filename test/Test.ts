import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { FTXDeployer } from "../typechain-types";

  describe("Deployment", function () {
    it("Deploy", async function () {
      const SUPPLY = await ethers.parseEther("1100000000");
      const daoOwnerAddress = "0x7798Ba9512B5A684C12e31518923Ea4221A41Fb9";     
      
      const deployer: FTXDeployer = await ethers.deployContract("FTXDeployer");
      const deployerAddress: string = await deployer.getAddress();
      console.log("Deployer address", deployerAddress)

      const treasury = await ethers.getContractAt("DaoTreasury", "0x767E095f6549050b4e9A3BccE18AadD28beF486f");
      const treasuryAddress = await treasury.getAddress();
      console.log("Treasury address", treasuryAddress)

      
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

      // await deployer.deploy();
      let ABI = ["function deploy()"]
      const calldata_deploy = new ethers.Interface(ABI).encodeFunctionData("deploy", []);      

      await treasury.connect(daoOwner).execute(
        [await deployer.getAddress()], 
        [calldata_deploy], 
        [0],
        {
          gasLimit: 3_000_000
        }
      );

      console.log(`Deployed the FTX contract at address ${await deployer.tokenAddress()}!`);

      const FTX = await ethers.getContractAt("FTX", await deployer.tokenAddress());
      expect(await FTX.balanceOf(treasuryAddress)).to.equal(SUPPLY * BigInt(9) / BigInt(10));
      expect(await FTX.balanceOf(await deployer.tokenAddress())).to.equal(SUPPLY / BigInt(10));


      const ABI_LP = ["function createLPPool(int24 initialTick, int24 upperTick)"];
      const calldata_createLP = new ethers.Interface(ABI_LP).encodeFunctionData("createLPPool", [0, 887200]);

      await treasury.connect(daoOwner).execute(
        [await deployer.tokenAddress()], 
        [calldata_createLP], 
        [0],
        {
          gasLimit: 6_000_000
        }
      );

      expect(await FTX.balanceOf(treasuryAddress)).to.equal(SUPPLY * BigInt(9) / BigInt(10));
      expect(await FTX.balanceOf(await deployer.tokenAddress())).to.equal(0);
      
      const nonFungibleManager = await ethers.getContractAt("INonfungiblePositionManager", "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1");
      // Fetch Transfer events where the `to` address matches the target
      const filter = nonFungibleManager.filters.Transfer(undefined, treasuryAddress);
      const events = await nonFungibleManager.queryFilter(filter);
  
      // events[0] -> initial UniV3 liquidity pool NFT
      // events[1] -> just generated
      expect(await nonFungibleManager.ownerOf(events[1].args.tokenId)).to.equal(treasuryAddress);
    });

  });



// deploy ERC20 through the DAO
// daoTreasury -> fundraising, sending out tokens to everyone....
// execute() -> DAO manager to execute any function call
// task -> create a ERC20 through this execute interface, and create a UniswapV3 LP with this newly created token / Alameda Research V2 ERC20 token
// 1% fee
// deploy script so that the whole thing gets deployed


