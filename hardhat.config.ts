import { HardhatUserConfig, vars } from "hardhat/config";
require("hardhat-tracer");
import "@nomicfoundation/hardhat-toolbox";
import * as tenderly from "@tenderly/hardhat-tenderly";

// tenderly.setup({ automaticVerifications: true });

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");



const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          "optimizer": {
            "enabled": true,
            "runs": 0
          },
        },
      },
    ],
  },
  tenderly: {
    // https://docs.tenderly.co/account/projects/account-project-slug
    project: "Project",
    username: "ukitta555",
  },
  networks: {
    virtualMainnet: {
      url: "https://virtual.base.rpc.tenderly.co/bd25cbd7-2497-465d-b534-b0839672b3bd",
    },
    
    hardhat: {
      forking: {
        url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 24099124
      }
    }
  },
};

export default config;
