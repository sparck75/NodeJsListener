const WETH = artifacts.require("WETH");
const PancakeRouter = artifacts.require("PancakeRouter");
const PancakeFactory = artifacts.require("PancakeFactory");
const BN = require("bn.js");

contract("Flashswap Test",(accounts)=> {
    let weth = null;
    let pancakeswaprouter = null;
    let pancakefact = null;
    let firstConfirm = 0;
    let BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
    before(async() => {
        weth = await WETH.at('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');
        pancakeswaprouter = await PancakeRouter.at("0x10ED43C718714eb63d5aA57B78B54704E256024E");
        pancakefact = await PancakeFactory.at("0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
    });
    it("First Swap WBNB for BUSD", async() =>{
        console.log("Account:-",accounts[0])
        return pancakeswaprouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            [weth.address,BUSD],
            accounts[0],
            Math.floor(Date.now() / 1000) + 60 * 10,
            {value:2,gas:200000,gasPrice:null}
        ).then(async()=> {
            firstConfirm+= 1;
            console.log("Transaction number:-",firstConfirm)
        } )
     });
     it("Second Swap WBNB for BUSD", async() =>{
        console.log("Account:-",accounts[1])
        return pancakeswaprouter.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            [weth.address,BUSD],
            accounts[1],
            Math.floor(Date.now() / 1000) + 60 * 10,
            {from:accounts[1],value:1,gas:5000000,gasPrice:null}
        ).then(async()=> {
            firstConfirm+= 1;
            console.log("2nd Transaction number:-",firstConfirm)
        } )
     });

})