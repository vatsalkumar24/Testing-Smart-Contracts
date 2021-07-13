// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.6.6;
pragma experimental ABIEncoderV2;

import './TransferHelperTest.sol';
import './IUniswapV2Router02.sol';
import './IERC20.sol';
import './UniswapV2LiquidityMathLibrary.sol';
import './UniswapV2Library.sol';


contract ExampleSwapToPrice {
    using SafeMath for uint256;

    IUniswapV2Router02 immutable router;
    address immutable factory;

    constructor(address factory_, IUniswapV2Router02 router_) public {
        factory = factory_;
        router = router_;
    }

    // swaps an amount of either token such that the trade is profit-maximizing, given an external true price
    // true price is expressed in the ratio of token A to token B
    // caller must approve this contract to spend whichever token is intended to be swapped
    struct Tokens{
            address tokenA;
            address tokenB;
        }
        struct truepriceTokens{
            uint256 truepricetokenA;
            uint256 truepricetokenB;
            uint256 truepricetokenC;
        }
    function swapToPrice(
        Tokens memory tokens,
        truepriceTokens memory truepricetokens,
        uint256 maxSpendTokenA,
        uint256 maxSpendTokenB,
        address to,
        uint256 deadline
    ) public {
        // true price is expressed as a ratio, so both values must be non-zero
        require(truepricetokens.truepricetokenA != 0 && truepricetokens.truepricetokenB != 0, "ExampleSwapToPrice: ZERO_PRICE");
        // caller can specify 0 for either if they wish to swap in only one direction, but not both
        require(maxSpendTokenA != 0 || maxSpendTokenB != 0, "ExampleSwapToPrice: ZERO_SPEND");

        bool aToB;
        uint256 amountIn;
        {
            (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(factory, tokens.tokenA, tokens.tokenB);
            (aToB, amountIn) = UniswapV2LiquidityMathLibrary.computeProfitMaximizingTrade(
                truepricetokens.truepricetokenA, truepricetokens.truepricetokenB,
                reserveA, reserveB
            );
        }

        require(amountIn > 0, 'ExampleSwapToPrice: ZERO_AMOUNT_IN');

        // spend up to the allowance of the token in
        uint256 maxSpend = aToB ? maxSpendTokenA : maxSpendTokenB;
        if (amountIn > maxSpend) {
            amountIn = maxSpend;
        }

        address tokenIn = aToB ? tokens.tokenA : tokens.tokenB;
        address tokenOut = aToB ? tokens.tokenB : tokens.tokenA;
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(tokenIn, address(router), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        router.swapExactTokensForTokens(
            amountIn,
            0, // amountOutMin: we can skip computing this number because the math is tested
            path,
            to,
            deadline
        );
    }
    
    function uniswapV2Call(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external {
      address[] memory path = new address[](2);
      (uint amountRequired, uint deadline) = abi.decode(_data, (uint, uint));
      if (_amount0 == 0) {
        uint amountEntryToken =_amount1;
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        IERC20 entryToken = IERC20(token1);
        IERC20 exitToken = IERC20(token0);
        entryToken.approve(address(router), amountEntryToken);  
        path[0] = token1; 
        path[1] = token0;
        uint amountReceived = router.swapExactTokensForTokens(amountEntryToken, 0, path, address(this), deadline)[1];
        exitToken.transfer(msg.sender, amountRequired);      
        exitToken.transfer(_sender, amountReceived-amountRequired);   
      } else {
        uint amountEntryToken = _amount0;
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        IERC20 entryToken = IERC20(token0);
        IERC20 exitToken = IERC20(token1);
        entryToken.approve(address(router), amountEntryToken);
        path[0] = token0;
        path[1] = token1;
        uint amountReceived = router.swapExactTokensForTokens(amountEntryToken, 0, path, address(this), deadline)[1];
        exitToken.transfer(msg.sender, amountRequired);
        exitToken.transfer(_sender, amountReceived-amountRequired);   
      }
  }
}