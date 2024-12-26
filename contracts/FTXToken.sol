// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;
pragma abicoder v2;

// import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TickMath} from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import {IUniswapV3Factory, INonfungiblePositionManager, IUniswapV3Pool, PoolInitializer} from "./Interfaces.sol";
import {IERC721Receiver} from "./IERC721Receiver.sol";
import "hardhat/console.sol";


contract FTX is ERC20, IERC721Receiver {
    // using SafeERC20 for ERC20;
    using TickMath for int24;
    uint256 public constant SUPPLY = 1_100_000_000 ether;
    uint24 public constant UNI_V3_FEE = 10000; 
    address private  _owner = address(0x0);
    IUniswapV3Factory public constant UNISWAP_V3_FACTORY = IUniswapV3Factory(0x33128a8fC17869897dcE68Ed026d694621f6FDfD);
    INonfungiblePositionManager public constant POSITION_MANAGER =
        INonfungiblePositionManager(0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1);
    address public constant AR_TOKEN = address(0x3e43cB385A6925986e7ea0f0dcdAEc06673d4e10);

    
    constructor(address _dao_treasury) ERC20("Fiscally Transparent eXchange", "FTX")  {
        _mint(address(this), SUPPLY / 2);
        _owner = _dao_treasury;
        _mint(_owner, SUPPLY / 2);
    }

    function createLPPool(int24 initialTick, int24 upperTick) external 
    // onlyOwner 
    {
        // setup the uniswap v3 pool    
        uint160 sqrtPriceX96 = upperTick.getSqrtRatioAtTick();
        // console.logInt(initialTick);
        // console.logInt(upperTick);
    
        
        address pool = PoolInitializer(address(POSITION_MANAGER)).createAndInitializePoolIfNecessary(AR_TOKEN, address(this), UNI_V3_FEE, sqrtPriceX96);
        // IUniswapV3Pool(pool).initialize(sqrtPriceX96);

        // console.log("here");
        // console.log("Pool ", pool);
        console.log(IUniswapV3Pool(pool).token0(), AR_TOKEN, ERC20(AR_TOKEN).name());
        console.log(IUniswapV3Pool(pool).token1(), address(this), ERC20(address(this)).name());


        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: address(AR_TOKEN),
            token1: address(this),
            fee: UNI_V3_FEE,
            tickLower: initialTick,
            tickUpper: upperTick,
            amount0Desired: 0,
            amount1Desired: SUPPLY / 2,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: type(uint256).max
        });

        int24 tickSpacing = IUniswapV3Factory(UNISWAP_V3_FACTORY).feeAmountTickSpacing(UNI_V3_FEE);
        require(initialTick % tickSpacing == 0 && upperTick % tickSpacing == 0, "Ticks must align with tick spacing");
        require(AR_TOKEN < address(this), "LMAO");

        // console.log(allowance(address(this), address(POSITION_MANAGER)));
        ERC20(address(this)).approve(address(POSITION_MANAGER), SUPPLY / 2);
        // console.log(allowance(address(this), address(POSITION_MANAGER)));
        
        
        // // transfer ownership to 0 address so no more tokens can be minted
        // renounceOwnership();
        (uint256 tokenId,,,) = POSITION_MANAGER.mint(params);
        
        // POSITION_MANAGER.safeTransferFrom(address(this), _owner, tokenId);
    } 

    function onERC721Received(address, address, uint256, bytes calldata) override external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}
