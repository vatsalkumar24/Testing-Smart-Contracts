[
   {
     "inputs": [
       {
         "internalType": "address",
         "name": "_uniswap",
         "type": "address"
       },
       {
         "internalType": "address",
         "name": "_uniswapFactory",
         "type": "address"
       },
       {
         "internalType": "address",
         "name": "_uniswapOracle",
         "type": "address"
       }
     ],
     "stateMutability": "nonpayable",
     "type": "constructor"
   },
   {
     "inputs": [],
     "name": "soloMargin",
     "outputs": [
       {
         "internalType": "contract ISoloMargin",
         "name": "",
         "type": "address"
       }
     ],
     "stateMutability": "view",
     "type": "function"
   },
   {
     "inputs": [
       {
         "internalType": "uint256",
         "name": "loanAmount",
         "type": "uint256"
       },
       {
         "internalType": "address",
         "name": "tokenA",
         "type": "address"
       },
       {
         "internalType": "address",
         "name": "tokenB",
         "type": "address"
       },
       {
         "internalType": "address",
         "name": "tokenC",
         "type": "address"
       }
     ],
     "name": "flashLoan",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
   },
   {
     "inputs": [
       {
         "internalType": "address",
         "name": "sender",
         "type": "address"
       },
       {
         "components": [
           {
             "internalType": "address",
             "name": "owner",
             "type": "address"
           },
           {
             "internalType": "uint256",
             "name": "number",
             "type": "uint256"
           }
         ],
         "internalType": "struct Account.Info",
         "name": "accountInfo",
         "type": "tuple"
       },
       {
         "internalType": "bytes",
         "name": "data",
         "type": "bytes"
       }
     ],
     "name": "callFunction",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
   },
   {
     "inputs": [
       {
         "internalType": "address",
         "name": "token",
         "type": "address"
       }
     ],
     "name": "_getMarketIdFromTokenAddress",
     "outputs": [
       {
         "internalType": "uint256",
         "name": "",
         "type": "uint256"
       }
     ],
     "stateMutability": "view",
     "type": "function"
   }
 ]