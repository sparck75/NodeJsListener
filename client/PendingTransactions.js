const Web3 = require('web3');

const Decimal = require('decimal.js');
const WEI = 100000000000000;

const ethToWei = (amount) => new Decimal(amount).times(WEI);
require('dotenv').config();
let WALLET_FROM = null;
let WALLET_TO = null;
let AMOUNT = null;
let Router = "0x9ac64cc6e4415144c455bd8e4837fea55603e5c3";
const init = async () => {
    // Instantiate web3 with WebSocket provider
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
        const trx = await web3Http.eth.getTransaction(txHash);
        const valid = validateTransaction(trx)
        // If transaction is not valid, simply return
        if (!valid) return

       // 
          console.log("_-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-__-_-_-_-_-_-_-_-_");
          console.log('Found incoming Ether transaction from ' + WALLET_FROM + ' to ' + WALLET_TO);
          console.log('Transaction value is: ' + ethToWei(AMOUNT));
          console.log('Transaction hash is: ' + txHash + '\n');
          console.log("The transactions gasFee:-",trx.gas);
          console.log("The transactions gasPrice:-",trx.gasPrice);   
          console.log("The transactions Input",trx.input);      
          //con
          //Decode Transactions
          if (WALLET_TO == Router ) {
              let xinput = trx.input;
              let decodeInput = web3.eth.abi.decodeParameters(["uint256","address[]","address","uint256"],xinput.substr(10,xinput.length));
              console.log("Input Result:-",decodeInput);
         }
       // else {
          //console.log('Transaction hash is: ' + WALLET_TO + '\n');
       // }
       
       
      }
      catch (error) {
        console.log(error)
      }
    })
  }
  init();

  const validateTransaction = (trx)=> {
  //const toValid = trx.to != null
  let toValid;
 if (trx.to != null) 
    toValid = trx.to;

  if (!toValid) return false
  
  const walletToValid = trx.to.toLowerCase(); ///=== process.env.WALLET_TO.toLowerCase()
  const walletFromValid = trx.from.toLowerCase();//=== process.env.WALLET_FROM.toLowerCase()
  const amountValid = trx.value;//ethToWei(process.env.AMOUNT).equals(trx.value);
  WALLET_FROM = walletFromValid;
  WALLET_TO =walletToValid;
  AMOUNT =amountValid;

  return toValid && walletToValid && walletFromValid && amountValid
}