// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import {FTX} from "./FTXToken.sol";

library BytesUtils {
    function fromLast20Bytes(bytes32 data) internal pure returns (address) {
        return address(uint160(uint256(data)));
    }
}


contract FTXDeployer {
    using BytesUtils for bytes32;
    address public constant AR_TOKEN = address(0x3e43cB385A6925986e7ea0f0dcdAEc06673d4e10);
    address public tokenAddress = address(0x0);
    
    function deploy() public {
        bytes32 salt;
        address token;
        for (uint256 i;; i++) {
            salt = bytes32(i);
            token = predictTokenAddress(msg.sender, salt, abi.encode(msg.sender));
            if (token < AR_TOKEN && !isContractDeployed(token)) {
                break;
            }
        }

        tokenAddress = address(new FTX{salt: keccak256(abi.encode(msg.sender, salt))}(msg.sender)); 
    }

    /// @notice Predicts the address of a token before it is created
    /// @param deployer The address that will deploy the token
    /// @param salt A unique value to ensure a unique token address
    /// @param constructorArgs The encoded constructor arguments for the token
    /// @return result The predicted address of the token
    function predictTokenAddress(address deployer, bytes32 salt, bytes memory constructorArgs)
        public
        view
        virtual
        returns (address result)
    {
        bytes32 create2Salt = keccak256(abi.encode(deployer, salt));
        bytes32 deploymentHash = keccak256(abi.encodePacked(type(FTX).creationCode, constructorArgs));
        result = keccak256(
            abi.encodePacked(
                bytes1(0xFF),
                address(this),
                create2Salt,
                deploymentHash
            )
        ).fromLast20Bytes();
    }

    function isContractDeployed(address token) public view returns (bool isDeployed) {
        uint256 size;
        assembly {
            size := extcodesize(token)
        }
        isDeployed = size > 0;
    }

}


// daoOwner -> execute() in treasury -> deploy() -> creates an ERC20  - call #1 to execute()
// daoOwner -> execute() in treasury -> createLP(tickLower, tickUpper) in the created ERC20 


// deploy.ts -> parametrize tickLower tickUpper
