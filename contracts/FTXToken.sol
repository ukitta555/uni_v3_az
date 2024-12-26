// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TickMath} from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import {IUniswapV3Factory, INonfungiblePositionManager, IUniswapV3Pool, PoolInitializer} from "./Interfaces.sol";
import {IERC721Receiver} from "./IERC721Receiver.sol";


contract FTX is ERC20, IERC721Receiver {
    using TickMath for int24;

    uint256 public constant SUPPLY = 1_100_000_000 ether;
    uint24 public constant UNI_V3_FEE = 10000; 
    address private  _owner = address(0x0);
    IUniswapV3Factory public constant UNISWAP_V3_FACTORY = IUniswapV3Factory(0x33128a8fC17869897dcE68Ed026d694621f6FDfD);
    INonfungiblePositionManager public constant POSITION_MANAGER =
        INonfungiblePositionManager(0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1);
    address public constant AR_TOKEN = address(0x3e43cB385A6925986e7ea0f0dcdAEc06673d4e10);

    
    constructor(address _dao_treasury) ERC20("Fiscally Transparent eXchange", "FTX")  {
        _mint(address(this), SUPPLY / 10);
        _owner = _dao_treasury;
        _mint(_owner, SUPPLY * 9 / 10);
    }

    function createLPPool(int24 initialTick, int24 upperTick) external {
        // setup the uniswap v3 pool    
        uint160 sqrtPriceX96 = initialTick.getSqrtRatioAtTick();        
        PoolInitializer(address(POSITION_MANAGER)).createAndInitializePoolIfNecessary(address(this), AR_TOKEN, UNI_V3_FEE, sqrtPriceX96);

        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: address(this),
            token1: address(AR_TOKEN),
            fee: UNI_V3_FEE,
            tickLower: initialTick,
            tickUpper: upperTick,
            amount0Desired: SUPPLY / 10,
            amount1Desired: 0,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: type(uint256).max
        });


        ERC20(address(this)).approve(address(POSITION_MANAGER), SUPPLY / 10);

        (uint256 tokenId,,,) = POSITION_MANAGER.mint(params);
        POSITION_MANAGER.safeTransferFrom(address(this), _owner, tokenId);
    } 

    function onERC721Received(address, address, uint256, bytes calldata) override external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}
