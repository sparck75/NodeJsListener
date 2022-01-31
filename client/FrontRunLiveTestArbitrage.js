const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = require("../secrets.json").mnemonic;

const prompt = require('prompt');
const WETH = require("../build/contract/WETH.json");
const PancakeRouter = require("../build/contract/pancakeRouter.json");
const PancakeFactory = require("../build/contract/pancakeFactory.json");

const ERC20 = require("../build/contract/ERC20.json");

const BN = require("bn.js");
require('dotenv').config();

prompt.start();

var provider = new HDWalletProvider(mnemonic, process.env.MORALIS_URL_TESTNET);
const web3 = new Web3 (provider);
let BUSD = "0x78867bbeef44f2326bf8ddd1941a4439382ef2a7";
let address = null;

const init = async() => {
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
    console.log(address[0]);
    console.log(address[1]);
    console.log("Account Balance:-",account_balance)
    console.log("Account two Balance:-",account_two_balance)
    console.log("Weth Balance:-",weth_totalBalance);
    // get GasPrice
    const gasvPrice = await web3.eth.getGasPrice();
    console.log("Estimated GasPrice:-",web3.utils.fromWei(gasvPrice, 'ether'));
       
    //Carry out the swap
    swapToken(0.01);
    
    //sendTrx();
    
    sleep(1000).then(() =>{swapTwoToken(0.001);})
    
}
const sleep  = (ms) => {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}
const getAmountMinOut = async (amountIn) => {
    let router = new web3.eth.Contract(
        PancakeRouter.abi,
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );

    let getAmountMin = await router.methods.getAmountsOut(
        amountIn,
        ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",BUSD]
    ).call({from:address[0]});
    console.log("Amount-MinOut:-",getAmountMin[1]);
   return getAmountMin[1];
}
const swapToken = async (amountIn) => {
    console.log("Address:-",address[0]);
    let router = new web3.eth.Contract(
        PancakeRouter.abi,
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );

    try {
     return router.methods.getAmountsOut(
            web3.utils.toWei(amountIn.toString(),'ether') ,
            ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",BUSD]
        ).call({from:address[0]}).then(async getAmountMin=> {
            console.log("Amount-MinOut:-",parseInt(getAmountMin[1]));
            let amountMin = parseInt(getAmountMin[1]);
            let Slippage = amountMin-(amountMin*0.005);
            console.log('Slipage Amount:-',Slippage);
            try {
                let swapBUSD = await router.methods.swapExactETHForTokens(
                    Slippage.toString(),
                    ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",BUSD],
                    address[0],
                    Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[0],value:web3.utils.toWei(amountIn.toString(),'ether'),gas:205254,gasPrice:10000000000});
                console.log("Swap Report:-",swapBUSD);                
            } catch (error) {
                console.error("Error",error)
            }
            
        });

    } catch (err) {
        console.error(err);
        
    }

}
const swapTwoToken = async (amountMinIn) => {
    console.log(address[1]);
    let router = new web3.eth.Contract(
        PancakeRouter.abi,
        "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"
    );
    let routerv2 = new web3.eth.Contract(
        PancakeRouter.abi,
        "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
    );
    let BUSD_ERC20 = new web3.eth.Contract(
        ERC20.abi,
        BUSD
    );

    try {
        return router.methods.getAmountsOut(
            web3.utils.toWei(amountMinIn.toString(),'ether') ,
            ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",BUSD]
        ).call({from:address[1]}).then(async getAmountMin=> {
            console.log("Amount--MinOut:-",parseInt(getAmountMin[1]));
            let amountMin = parseInt(getAmountMin[1]);
            let Slippage = amountMin-(amountMin*0.005);
            console.log('Slipage-- Amount:-',Slippage);

            try {
                let swapBUSD = await router.methods.swapExactETHForTokens(
                    Slippage.toString(),
                    ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",BUSD],
                    address[1],
                    Math.floor(Date.now() / 1000) + 60 * 10).send({from:address[1],value:web3.utils.toWei(amountMinIn.toString(),'ether'),gas:300000,gasPrice:50000000000});
                    console.log("Swap Two Report:-",swapBUSD);                
       
                    //Swap Back to
                    let amountIn = await BUSD_ERC20.methods.balanceOf(address[1]).call({from:address[1]});
                    console.log("Amount of TOken Recieved:-",amountIn.toString());

                    return BUSD_ERC20.methods.approve("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",amountIn).call({from:address[1]}).then(async result=> {
                        console.log("Approve Contract:-",result);
                        let swapBUSDToBNB = await routerv2.methods.swapExactTokensForETH(
                            amountIn,
                            0,
                            [BUSD,"0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"],
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

const sendTrx = async () => {
    try {
        let send = await web3.eth.sendTransaction({from:address[3],to:address[1],value:web3.utils.toWei('0.01','ether')});
    console.log("Send Trnx:-",send);
    } catch (error){
        console.error(error);
        
    }
    
}
const sendTTrx = async () => {
    try {
        let send = await web3.eth.sendTransaction({from:address[1],to:address[3],value:web3.utils.toWei('0.01','ether'),gas:3000000,gasPrice:50000000000});
    console.log("Send Two Trnx:-",send);
    } catch (error){
        console.error(error);
        
    }
    
}


init();
