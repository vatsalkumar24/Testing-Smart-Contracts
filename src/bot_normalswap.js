require("dotenv").config();
require("colors");
const Web3 = require("web3");
// import {
//   Solo,
//   Networks,
//   MarketId,
//   BigNumber,
//   AccountNumbers,
// } from "@dydxprotocol/solo";
// import { escapeLeadingUnderscores } from "typescript";

const dydxprotocol = require("@dydxprotocol/solo");
const typescript = require("typescript");
const IFactory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");
const IPair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IRouter = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
const Utils = require("../build/contracts/Utils.json");
const IERC20 = require("@uniswap/v2-periphery/build/IERC20.json");

const addrDai = process.env.ADDR_DAI;
const addrEth = process.env.ADDR_ETH;
let addrToken0 = process.env.ADDR_TOKEN0;
let addrToken1 = process.env.ADDR_TOKEN1;
let addrToken2 = process.env.ADDR_TOKEN2;
const addrUFactory = process.env.ADDR_UFACTORY;
const addrURouter = process.env.ADDR_UROUTER;
const addrUtils = process.env.ADDR_UTILS;
const localDeplyment = process.env.LOCAL_DEPLOYMENT;
const priceToken0 = process.env.PRICE_TOKEN0;
const priceToken1 = process.env.PRICE_TOKEN1;
const privateKey = process.env.PRIVATE_KEY;
const projectId = process.env.PROJECT_ID;
const validPeriod = process.env.VALID_PERIOD;
let web3;
let localProvider;
if (localDeplyment) {
  const localProviderUrl = "http://localhost:8545";
  localProvider = new Web3.providers.WebsocketProvider(localProviderUrl);
  web3 = new Web3(localProvider);
} else {
  web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${projectId}`);
}

const fs = require('fs');
const Oraclecontract = JSON.parse(fs.readFileSync('./build/contracts/UniswapV2OracleLibrary.json', 'utf8'));
//const Oracleabi = require("../abi/uniswaporacle" + ".abi.js");
uniswapOracle = new web3.eth.Contract(Oraclecontract.abi, "0xf8e81D47203A594245E36C48e151709F0C19fBe8");
const Flashloancontract = JSON.parse(fs.readFileSync('./build/contracts/FlashLoanTemplate.json', 'utf8'));
//const Flashloanabi = require("../abi/DydxFlashLoan" + ".abi.js");
DydxFlashLoan = new web3.eth.Contract(Flashloancontract.abi, "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47");

if (addrToken0 > addrToken1) {
  aux = addrToken0;
  addrToken0 = addrToken1;
  addrToken1 = aux;
}


//Initialize with Web3 provider for dydx
const solo = new dydxprotocol.Solo(web3.currentProvider, dydxprotocol.Networks.MAINNET, {
  defaultAccount: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
  accounts: [
    {
      address: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
      privateKey:
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    },
  ],
});

const uFactory = new web3.eth.Contract(IFactory.abi, addrUFactory);
const uRouter = new web3.eth.Contract(IRouter.abi, addrURouter);
const token0 = new web3.eth.Contract(IERC20.abi, addrToken0);
const token1 = new web3.eth.Contract(IERC20.abi, addrToken1);
const token2 = new web3.eth.Contract(IERC20.abi, addrEth);
//console.log(IERC20.abi);
const utils = new web3.eth.Contract(Utils.abi, addrUtils);
//console.log(utils);
let uPair0,
  uPair1,
  uPair2,
  myAccount,
  token0Name,
  token1Name,
  token2Name,
  token0Symbol,
  token1Symbol,
  token2Symbol;

const r1 = 0.997;
const r2 = 1;
// uFactory.methods.getPair(token0.options.address, token2.options.address).call().then(function(result){
//   console.log(result);
// });
async function asyncsVar() {
  uPair0 = new web3.eth.Contract(
    IPair.abi,
    await uFactory.methods
      .getPair(token0.options.address, token1.options.address)
      .call()
  );

  uPair1 = new web3.eth.Contract(
    IPair.abi,
    await uFactory.methods
      .getPair(token0.options.address, token2.options.address)
      .call()
  );

  uPair2 = new web3.eth.Contract(
    IPair.abi,
    await uFactory.methods
      .getPair(token2.options.address, token1.options.address)
      .call()
  );

  const accountObj = await web3.eth.accounts.privateKeyToAccount(privateKey);
  myAccount = accountObj.address;

  token0Name = await token0.methods.name().call();
  token0Symbol = await token0.methods.symbol().call();
  token1Name = await token1.methods.name().call();
  token1Symbol = await token1.methods.symbol().call();
  token2Name = await token2.methods.name().call();
  token2Symbol = await token2.methods.symbol().call();
  console.log(
    `\n${token0Name} (${token0Symbol}) {token0}\n` +
      `Deployed at ${token0.options.address}\n\n` +
      `${token1Name} (${token1Symbol}) {token1}\n` +
      `Deployed at ${token1.options.address}\n` +
      `${token2Name} (${token2Symbol}) {token2}\n` +
      `Deployed at ${token2.options.address}\n` 
  );
}


asyncsVar();

const newBlockEvent = web3.eth.subscribe("newBlockHeaders");

newBlockEvent.on("connected", () => {
  console.log("\nBot listening!\n");
});

let skip = true;
newBlockEvent.on("data", async function (blockHeader) {
  skip = !skip;
  if (skip) return; 

  try{
    console.log(`Block Number: ${blockHeader.number}`)
    let uReserves, uReserve0, uReserve1;
    let arbIndex = 0;

    uReserves = await uPair0.methods.getReserves().call();
    pair01 = (uReserves[0]/10**6) / (uReserves[1]/10**6);
    console.log(`\n${uReserves[0]/10**6} (${uReserves[1]/10**6}) (${pair01})\n`)

    uReserve0 = await uPair1.methods.getReserves().call();
    pair02 = (uReserve0[0]/10**6) / (uReserve0[1]/10**6);
    console.log(`\n${uReserve0[0]/10**6} (${uReserve0[1]/10**6}) (${pair02})\n`)

    uReserve1 = await uPair2.methods.getReserves().call();
    pair21 = (uReserve1[0]/10**6) / (uReserve1[1]/10**6);
    console.log(`\n${uReserve1[0]/10**6} (${uReserve1[1]/10**6}) (${pair21})\n`)

    const ratio = [pair01,pair02,pair21]
    const reserves = [uReserves, uReserve0, uReserve1];
    const pairs = [uPair0, uPair1, uPair2];
    const k = 1;
    console.log(`k: ${k}`)
    for (i = 2; i >= 0; i--) {
      const ratioMax = (ratio[2 - i] / ratio[i]) * ratio[i - k + 1];
      if (ratioMax > arbIndex) {
        arbIndex = ratioMax;
        reservesAC = reserves[2 - i];
        reservesAB = reserves[i];
        reservesBC = reserves[i - k + 1];
        pairsAC = pairs[2 - i];
        pairsAB = pairs[i];
        pairsBC = pairs[i - k + 1];
      }
    }
    console.log(`\narbIndex: ${arbIndex}\n`)
    tokenA = await pairsAC.methods.token0.call();
    tokenC = await pairsAC.methods.token1.call();
    tokenB = await pairsBC.methods.token0.call();

    if (arbIndex >= 1.0009) {
      truePrice = await uniswapOracle.methods
        .currentCumulativePrices(pairsAB)
        .call();

      const result = await utils.methods
        .computeProfitMaximizingTrade(
          truePrice[0],
          truePrice[1],
          uReserve0,
          uReserve1
        )
        .call();
      const aToB = result[0];
      const amountIn = result[1];

      if (amountIn == 0) {
        console.log(`No arbitrage opportunity on block ${blockHeader.number}\n`);
        return;
      }

      if (aToB) {
        a1 = reservesAB[0];
        b1 = reservesAB[1];
        b2 = reservesBC[0];
        c2 = reservesBC[1];
        c3 = reservesBC20[0];
        a3 = reserves20[1];

        let Numerator1 =
          r1 *
          r2 *
          ((r1 * r1 * r2 * r2 * b1 * c2 * a3) /
            (b2 * c3 + r1 * r2 * b1 * c3 + r1 * r1 * r2 * r2 * b1 * c2));
        let Denominator1 =
          ((a1 * b2 * c3) /
            (b2 * c3 + r1 * r2 * b1 * c3 + r1 * r1 * r2 * r2 * b1 * c1) +
            r1 * aToB -
            1) *
          aToB;
        let UABCA = Numerator1 / Denominator1;

        let Numerator2 =
          r1 *
          r2 *
          ((r1 * r1 * r2 * r2 * b2 * c3 * a1) /
            (c2 * b1 + r1 * r2 * b1 * c3 + r1 * r1 * r2 * r2 * b2 * c3));
        let Denominator2 =
          ((b1 * c2 * a3) /
            (b1 * c2 + r1 * r2 * b1 * c3 + r1 * r1 * r2 * r2 * b2 * c3) +
            r1 * aToB -
            1) *
          aToB;
        let UACBA = Numerator2 / Denominator2;

        if (UABCA > UACBA && UABCA > 0) {
          await DydxFlashLoan.methods.flashLoan().call(tokenA, tokenB, tokenC);
        } else if (UABCA < UACBA && UACBA > 0) {
          await DydxFlashLoan.methods.flashLoan().call(tokenA, tokenC, tokenB);
        }
      }
    }
  }
  catch(error)
  {
    console.log(error);
  }
});
newBlockEvent.on('error', console.error);