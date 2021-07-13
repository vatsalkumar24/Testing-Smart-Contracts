// SPDX-License-Identifier: AGPL-3.0-or-later

// The ABI encoder is necessary, but older Solidity versions should work
pragma solidity >=0.6.6;
pragma experimental ABIEncoderV2;

import "./Swaptokens.sol";
import {UniswapV2OracleLibrary} from "./uniswaporacle.sol";

// These definitions are taken from across multiple dydx contracts, and are
// limited to just the bare minimum necessary to make flash loans work.
struct Tokens{
            address tokenA;
            address tokenB;
            address tokenC;
        }
struct truepriceTokens{
            uint256 truepricetokenA;
            uint256 truepricetokenB;
            uint256 truepricetokenC;
        }
library Types {
    enum AssetDenomination { Wei, Par }
    enum AssetReference { Delta, Target }
    struct AssetAmount {
        bool sign;
        AssetDenomination denomination;
        AssetReference ref;
        uint256 value;
    }
}

library Account {
    struct Info {
        address owner;
        uint256 number;
    }
}

library Actions {
    enum ActionType {
        Deposit, Withdraw, Transfer, Buy, Sell, Trade, Liquidate, Vaporize, Call
    }
    struct ActionArgs {
        ActionType actionType;
        uint256 accountId;
        Types.AssetAmount amount;
        uint256 primaryMarketId;
        uint256 secondaryMarketId;
        address otherAddress;
        uint256 otherAccountId;
        bytes data;
    }
}

interface ISoloMargin {
    function operate(Account.Info[] calldata accounts, Actions.ActionArgs[] calldata actions) external;
    function getNumMarkets() external view returns (uint256);
     function getMarketTokenAddress(uint256 marketId)
        external
        view
        returns (address);

}

// The interface for a contract to be callable after receiving a flash loan
interface ICallee {
    function callFunction(address sender, Account.Info calldata accountInfo, bytes calldata data) external;
}

interface UniswapV2Factory
{
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface Swaptokens
{
    
     function swapToPrice(
        Tokens calldata tokens,
        truepriceTokens calldata trupricetokens,
        uint256 maxSpendTokenA,
        uint256 maxSpendTokenB,
        address to,
        uint256 deadline
    ) external; 
    
      function uniswapV2Call(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external;
    
}

interface UniswapOracle
{
     function currentCumulativePrices(
        address pair
    ) external view returns (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp);
}


contract FlashLoanTemplate is ICallee {
    // The dydx Solo Margin contract, as can be found here:
    // https://github.com/dydxprotocol/solo/blob/master/migrations/deployed.json
 
    address _solo = 0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e;
    ISoloMargin public soloMargin = ISoloMargin(_solo);
    Swaptokens uniswaparb;
    UniswapV2Factory uniswapFactory;
    UniswapOracle oracle;

    constructor(address _uniswap, address _uniswapFactory, address _uniswapOracle) public {
        uniswaparb = Swaptokens(_uniswap);
        uniswapFactory = UniswapV2Factory(_uniswapFactory);
        oracle = UniswapOracle(_uniswapOracle);
    }
    
    // This is the function we call
    function flashLoan(uint loanAmount, address tokenA,
    address tokenB,
    address tokenC) external {
               
        uint256 marketId = _getMarketIdFromTokenAddress(tokenA);

        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

        operations[0] = Actions.ActionArgs({
            actionType: Actions.ActionType.Withdraw,
            accountId: 0,
            amount: Types.AssetAmount({
                sign: false,
                denomination: Types.AssetDenomination.Wei,
                ref: Types.AssetReference.Delta,
                value: loanAmount // Amount to borrow
            }),
            primaryMarketId: marketId,
            secondaryMarketId: 0,
            otherAddress: address(this),
            otherAccountId: 0,
            data: ""
        });
        
        operations[1] = Actions.ActionArgs({
                actionType: Actions.ActionType.Call,
                accountId: 0,
                amount: Types.AssetAmount({
                    sign: false,
                    denomination: Types.AssetDenomination.Wei,
                    ref: Types.AssetReference.Delta,
                    value: 0
                }),
                primaryMarketId: 0,
                secondaryMarketId: 0,
                otherAddress: address(this),
                otherAccountId: 0,
                data: abi.encode(
                    msg.sender,
                    loanAmount,
                    tokenA,
                    tokenB,
                    tokenC
                )
            });
        
        operations[2] = Actions.ActionArgs({
            actionType: Actions.ActionType.Deposit,
            accountId: 0,
            amount: Types.AssetAmount({
                sign: true,
                denomination: Types.AssetDenomination.Wei,
                ref: Types.AssetReference.Delta,
                value: loanAmount + 2 // Repayment amount with 2 wei fee
            }),
            primaryMarketId: 0, // WETH
            secondaryMarketId: 0,
            otherAddress: address(this),
            otherAccountId: 0,
            data: ""
        });

        Account.Info[] memory accountInfos = new Account.Info[](1);
        accountInfos[0] = Account.Info({owner: address(this), number: 1});

        soloMargin.operate(accountInfos, operations);
    }
    
    // This is the function called by dydx after giving us the loan
    function callFunction(address sender, Account.Info calldata accountInfo, bytes calldata data) external override{
        // Decode the passed variables from the data object
        Tokens memory tokens;
        truepriceTokens memory truepricetokens;
        (
            // This must match the variables defined in the Call object above
            address payable actualSender,
            uint loanAmount,
            address tokenA,
            address tokenB,
            address tokenC
        ) = abi.decode(data, (
            address, uint, address, address, address
        ));
        tokens.tokenA = tokenA;  tokens.tokenB = tokenB; tokens.tokenC = tokenC;
        IERC20 tokena = IERC20(tokens.tokenA);
        IERC20 tokenb = IERC20(tokens.tokenB);
        IERC20 tokenc = IERC20(tokens.tokenB = tokenB);
        
    
        // Give infinite approval to dydx to withdraw ERC20 on contract deployment,
        // so we don't have to approve the loan repayment amount (+2 wei) on each call.
        // The approval is used by the dydx contract to pay the loan back to itself.
        tokena.approve(address(soloMargin), uint(-1));
        
        address pairAB = uniswapFactory.getPair(tokenA, tokenB);
        uint32 blockTimestamp;
        //the naive smart contract simply looks up the current price and executes the trade, it is vulnerable to front-running and will likely suffer an economic loss. 
        //For this we use "true" price
        (truepricetokens.truepricetokenA, truepricetokens.truepricetokenB,blockTimestamp) = UniswapV2OracleLibrary.currentCumulativePrices(pairAB);
            
        
        
        //A->B
        uniswaparb.swapToPrice(
        tokens,
        truepricetokens,
        loanAmount,
        0,
        address(this),
        10
        );
        
        //From token swap of B to C and C to A, we need to swap all tokens otherwise there will be unsused tokens. 
        //B->C        
        uniswaparb.uniswapV2Call(address(this),tokenb.balanceOf(address(this)), 0, "");
        
        //C->A
        uniswaparb.uniswapV2Call(address(this),tokenc.balanceOf(address(this)), 0, "");

        
        // // the loan can't be paid
        require(tokena.balanceOf(address(this)) > loanAmount + 2, "CANNOT REPAY LOAN");
        actualSender.transfer(address(this).balance);
    }
    
    function _getMarketIdFromTokenAddress(address token)
        public
        view
        returns (uint256)
    {
     
        uint256 numMarkets = soloMargin.getNumMarkets();

        address curToken;
        for (uint256 i = 0; i < numMarkets; i++) {
            curToken = soloMargin.getMarketTokenAddress(i);

            if (curToken == token) {
                return i;
            }
        }

        revert("No marketId found for provided token");
    }
    
    

}