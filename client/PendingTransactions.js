const Web3 = require('web3');

const Decimal = require('decimal.js');
const FrontRun = require('./FrontRunLiveTest');
const WEI = 100000000000000;

const ethToWei = (amount) => new Decimal(amount).times(WEI);
require('dotenv').config();
let WALLET_FROM = null;
let WALLET_TO = null;
let AMOUNT = null;
let Router = "0x9ac64cc6e4415144c455bd8e4837fea55603e5c3";
let weth = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
let stateChange =1;
const init = async () => {
    // Instantiate web3 with WebSocket provider
    FrontRun.initiate();
    const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.MORALIS_WS_URL_TESTNET));
  
    // Instantiate subscription object
    const subscription = web3.eth.subscribe('pendingTransactions')
  
    // Subscribe to pending transactions
    subscription.subscribe((error, result) => {
      if (error) console.log(error)
    })
    .on('data', async (txHash) => {
      try {
        // Instantiate web3 with HttpProvider
       // console.log(txHash);
        const web3Http = new Web3(process.env.MORALIS_URL_TESTNET);
        //const trx = await web3Http.eth.getTransaction(txHash);
        const trx = await web3.eth.getTransaction(txHash);
        const valid = validateTransaction(trx)
        // If transaction is not valid, simply return
        if (!valid) return

       if (WALLET_TO == Router&& stateChange>0) {
          console.log("_-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-_");
          console.log('Found incoming Ether transaction from ' + WALLET_FROM + ' to ' + WALLET_TO);
          console.log('Transaction value is: ' + ethToWei(AMOUNT));
          console.log('Transaction hash is: ' + txHash + '\n');
          console.log("The transactions gasFee:-",trx.gas);
          console.log("The transactions gasPrice:-",trx.gasPrice);   
          console.log("The transactions Input",String(trx.input));      
          //con
          //Decode Transactions
          
              let xinput = String(trx.input);
              if (xinput.substr(0,10) == '0x7ff36ab5') {
                  let decodeInput = web3.eth.abi.decodeParameters(["uint256","address[]","address","uint256"],xinput.substr(10,xinput.length));
                  console.log("swapExactETHForTokens:-",decodeInput);
                  console.log("swapExactETHForTokensArrray:-",decodeInput[0]);
                  console.log("swapExactETHForTokensArrray:-",decodeInput[1]);
                  console.log("swapExactETHForTokensArrray:-",decodeInput[1][0]);
                  console.log("swapExactETHForTokensArrray:-",decodeInput[1][1]);
                  if (decodeInput[1][0].toString() == weth) {
                    FrontRun.swapTwoToken(decodeInput[1][1].toString())
                    stateChange = 0;
                  }
              } else if (xinput.substr(0,10) == '0x18cbafe5') {
                  let decodeInput = web3.eth.abi.decodeParameters(["uint256","uint256","address[]","address","uint256"],xinput.substr(10,xinput.length));
                  console.log("swapExactTokensForETH:-",decodeInput);
                  console.log("swapExactTokensForETHArrray:-",decodeInput[0]);
                  console.log("swapExactTokensForETHsArrray:-",decodeInput[1]);
              } else if (xinput.substr(0,10) == '0x38ed1739') {
                  let decodeInput = web3.eth.abi.decodeParameters(["uint256","uint256","address[]","address","uint256"],xinput.substr(10,xinput.length));
                  console.log("Swap Token For Token:-",decodeInput);
                  console.log("Swap Token For TokenArrray:-",decodeInput[0]);
                  console.log("Swap Token For TokenArrray:-",decodeInput[1]);
              } else if (xinput.substr(0,10) == '0xf305d719') {
                let decodeInput = web3.eth.abi.decodeParameters(["address","uint256","uint256","uint256","address","uint256"],xinput.substr(10,xinput.length));
                console.log("addLiquidityETH:-",decodeInput);
                console.log("addLiquidityETHArrray:-",decodeInput[0]);
                  console.log("addLiquidityETHArrray:-",decodeInput[1]);
              } 
              
         }
       // else {
          //console.log('Transaction hash is: ' + WALLET_TO + '\n');
       // }
       
       
      }
      catch (error) {
        console.log("Error")
      }
    })
  }
  init();

  const validateTransaction = (trx)=> {
  //const toValid = trx.to != null
  let toValid;
  try {
    if (trx.to != null) 
      toValid = trx.to;
    else
      return false;
  } catch (error) {
    console.error(trx);
  }

  if (!toValid) return false
  
  const walletToValid = trx.to.toLowerCase(); ///=== process.env.WALLET_TO.toLowerCase()
  const walletFromValid = trx.from.toLowerCase();//=== process.env.WALLET_FROM.toLowerCase()
  const amountValid = trx.value;//ethToWei(process.env.AMOUNT).equals(trx.value);
  WALLET_FROM = walletFromValid;
  WALLET_TO =walletToValid;
  AMOUNT =amountValid;

  return toValid && walletToValid && walletFromValid && amountValid
}