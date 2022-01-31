const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = require("../secrets.json").mnemonic;

const prompt = require('prompt');
const WETH = require("../build/contract/WETH.json");
const PancakeRouter = require("../build/contract/pancakeRouter.json");
const PancakeFactory = require("../build/contract/pancakeFactory.json");
const FrontRunBot = require("../build/contract/FrontRunBot.json");

const ERC20 = require("../build/contract/ERC20.json");

const BN = require("bn.js");
require('dotenv').config();

prompt.start();

var provider = new HDWalletProvider(mnemonic, process.env.MORALIS_URL_TESTNET);
const web3 = new Web3 (provider);
let BUSD = "0x78867bbeef44f2326bf8ddd1941a4439382ef2a7";
let address = null;

let FrontRunBotAddr = "0xDB8Ec346E84D781C2D620BDEEfd171EfBe8F869a";
module.exports.initiate = async() => {
    let weth = null;
    let pancakeswaprouter = null;
    let pancakefact = null;
    let firstConfirm = 0;

    address = await web3.eth.getAccounts();
    const id = await web3.eth.net.getId();
    const weth_contract = new web3.eth.Contract(
        WETH.abi,
        "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
    );
    const weth_totalBalance = await weth_contract.methods.totalSupply().call({from:address[0]});

    // get the balance of the current testnet account
    const account_balance = await web3.eth.getBalance(address[0]);
    const account_two_balance = await web3.eth.getBalance(address[2]);
    const pendingBlock = await web3.eth.getBlock('pending');
    console.log(address[0]);
    console.log(address[1]);
    console.log("Account Balance:-",account_balance)
    console.log("Account two Balance:-",account_two_balance)
    console.log("Weth Balance:-",weth_totalBalance);
    console.log("Get Pending Block:-",pendingBlock);
    // get GasPrice
    const gasvPrice = await web3.eth.getGasPrice();
    console.log("Estimated GasPrice:-",web3.utils.fromWei(gasvPrice, 'ether'));
    
}


//Export Module

module.exports.swapOneToken = async (token2,amountMinin,TrnxSlipage) => {
    let timer = 0;
    setInterval(()=>{
        timer+=0.5;
        //console.log("Timer:-",timer)
    },500);
    
    console.log(address[1]);
    console.log(token2);
    console.log("token",token2.length);
    
    console.log("Timer:-",timer)
     let router = new web3.eth.Contract(
        PancakeRouter.abi,
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );

    let BUSD_ERC20 = new web3.eth.Contract(
        ERC20.abi,
        token2[token2.length-1]
    );
    let amountMinIn = '0.0002';
    //swapThruBot(token2,'10000000000');
   try {
       
      // deterMinSlipage(router,amountMinin,TrnxSlipage,token2);
         router.methods.getAmountsOut(
            web3.utils.toWei(amountMinIn.toString(),'ether') ,
            //token2
           ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",token2[token2.length-1]]
        ).call({from:address[1],gas:3000000,gasPrice:null}).then(async getAmountMin=> {
           console.log("Timer:-",timer)
            console.log("Amount-Trx-MinOut:-",((getAmountMin)),"MinOutput For Swap",toFixed(getAmountMin[getAmountMin.length-1]));
            let amountMin = parseInt(getAmountMin[getAmountMin.length-1]);
            let Slippage = amountMin-(amountMin*0.001);
            
            //let BaseTransactionSlipage = (parseInt(getAmountMin[1])-parseInt(TrnxSlipage))/parseInt(getAmountMin[1]);
            //console.log("get Transaction Slippage:-",BaseTransactionSlipage)
            console.log('Slipage-Trx- Amount:-',toFixed(Slippage));

            try {
                console.log("Timer:-",timer)
                let swapBUSD =  await router.methods.swapExactETHForTokens(
                    toFixed(Slippage).toString().split('.')[0],
                    token2,//["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",token2[token2.length-1]],
                    address[1],
                    Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[1],value:web3.utils.toWei(amountMinIn.toString(),'ether'),gas:500000,gasPrice:100000000000});
                    console.log("Timer:-",timer)
                    console.log("Swap Two Report:-",swapBUSD);                
       
                    //Swap Back to
                    let amountIn = await BUSD_ERC20.methods.balanceOf(address[1]).call({from:address[1]});
                    console.log("Amount of TOken Recieved:-",amountIn.toString());

                    return BUSD_ERC20.methods.approve("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",amountIn).send({from:address[1]}).then(async result=> {
                        console.log("Timer:-",timer)
                        console.log("Approve Contract:-",result);
                        let swapBUSDToBNB = await router.methods.swapExactTokensForETH(
                            amountIn,
                            0,
                            [token2[token2.length-1],"0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"],
                            address[1],
                            Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[1],gas:300000,gasPrice:10000000000});
                        });    
                } catch (error) {
                    console.error("Error",error);
                }


        });
    } catch (err) {
        console.error(err);
        
    }
}


module.exports.swapTwoToken = async (token2,amountMinin,TrnxSlipage) => {

    
    console.log(address[1]);
    let router = new web3.eth.Contract(
        PancakeRouter.abi,
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );

    let token2_ERC20 = new web3.eth.Contract(
        ERC20.abi,
        token2[token2.length-1]
    );
        //deterMinSlipage(router,amountMinin,TrnxSlipage,token2);
        let swapBUSD = await router.methods.swapExactETHForTokens(
            0,
            token2,//["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",token2],//[weth,token]
            address[1],
            Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[1],value:web3.utils.toWei('0.0002','ether'),gas:200000,gasPrice:100000000000});
            console.log("Swap Two Report:-",swapBUSD);

try {
        //Swap Back to
        let amountIn = await token2_ERC20.methods.balanceOf(address[1]).call({from:address[1]});
        console.log("Amount of TOken Recieved:-",amountIn.toString());

        return token2_ERC20.methods.approve("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",amountIn).send({from:address[1]}).then(async result=> {
            console.log("Approve Contract:-",result);
            let swapBUSDToBNB = await router.methods.swapExactTokensForETH(
                amountIn,
                0,
                [token2[token2.length-1],"0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"],
                address[1],
                Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[1],gas:3000000,gasPrice:10000000000});
        } );
    } catch (err) {
        console.error("Error");
        
    }
    
}
const deterMinSlipage = (router,amountMinIn,TrnxSlipage,token2)=> {
    console.log("Token2:-",token2)
     router.methods.getAmountsOut((parseInt(amountMinIn)).toString() ,
        token2
        //["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",token2]
    ).call({from:address[1]}).then(async getAmountMin=> {
        console.log("Amount--MinOut:-",((getAmountMin)),"MinOutput For Swap",toFixed(getAmountMin[getAmountMin.length-1]));
        let amountMin = parseInt(getAmountMin[getAmountMin.length-1]);
        
        let BaseTransactionSlipage = (parseInt(getAmountMin[getAmountMin.length-1])-parseInt(TrnxSlipage))/parseInt(getAmountMin[getAmountMin.length-1]);
        console.log('Incoming Trnx Slipage-- Amount:-',toFixed(TrnxSlipage));
        console.log("get Transaction Slippage:-",BaseTransactionSlipage)
        
    });
}

const swapThruBot = async(trnx,amountIn) =>{
    let frontrunbot = new web3.eth.Contract(
        FrontRunBot.abi,
        FrontRunBotAddr
    );

    try {
        return frontrunbot.methods.initFrontRunTrnx(trnx,amountIn).send({from:address[1],gas:539701,gasPrice:null}).then(result => {
            console.log("Bot Rsult",result);
        })
    } catch (error) {
        console.error("Error");
        
    }
}
const toFixed = (x) =>{
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('e+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }