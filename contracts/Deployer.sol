// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import {FTX} from "./FTXToken.sol";

contract FTXDeployer {
    address public tokenAddress = address(0x0);
    address public daoTreasury = 0x767E095f6549050b4e9A3BccE18AadD28beF486f;
    
    function deploy() public {
        require (msg.sender == daoTreasury, "not treasury");
        tokenAddress = address(new FTX(daoTreasury)); 
    }
}
