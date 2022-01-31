//const BN = require("bn.js");
const FrontRunBot = artifacts.require("FrontRunBot");

contract("FrontRunBot Test",accounts=> {
    let frontrunB = null;
    let contractAddr = null;
    let wbnb = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
    let bether = "0x8babbb98678facc7342735486c851abd7a0d17ca";
    let usdt = "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684";
    let timer = 0;
    before(async() => {
        frontrunB = await FrontRunBot.deployed();
        contractAddr = frontrunB.address;
        console.log("Contract Address:-",contractAddr);
        setInterval(
            () =>{
                timer +=0.1
            },
            100
        )
    });
    it ("Send Ether to the deployed Contract",async()=> {
        let sendTransaction = await frontrunB.sendTransaction({from:accounts[0],value:'2000000000000000000'});
       //console.log("Transaction Info",sendTransaction)
        let contractBalance = await web3.eth.getBalance(contractAddr);
        console.log("Balance of Transaction:-",contractBalance);
    });
    it("Initiate getMinOutPut", async() =>{
        let initiateFrontTrn = await frontrunB.getAmountMinOut([wbnb,bether,usdt],"100000000000000","53386219104566415",{from:accounts[0],gas:300000,gasPrice:null})
        console.log("Transaction Output",initiateFrontTrn.toString());
        console.log("Timer:-",timer)
        //let contractBalance = await web3.eth.getBalance(contractAddr);
       //console.log("Balance of Transaction:-",contractBalance);
    } )
    it("Initiate the swap function of the bot", async() =>{
        let initiateFrontTrn = await frontrunB.initFrontRunTrnx([wbnb,bether,usdt],"100000000000000","53386219104566415",{from:accounts[0],gas:300000,gasPrice:20000000000})
        for (let x in initiateFrontTrn.logs)
            console.log("Transaction Output Message",initiateFrontTrn.logs[x].args.message,"Value:-",initiateFrontTrn.logs[x].args.val.toString());
        let contractBalance = await web3.eth.getBalance(contractAddr);
        console.log("Balance of Transaction:-",contractBalance);
        console.log("Timer:-",timer)
    } )
    it("Initiate getTokenBalancet", async() =>{
        let initiateFrontTrn = await frontrunB.getErC20Balance([wbnb,bether,usdt],{from:accounts[0],gas:300000,gasPrice:null})
        console.log("Balance Output",initiateFrontTrn.toString());
        console.log("Timer:-",timer)
        //let contractBalance = await web3.eth.getBalance(contractAddr);
       //console.log("Balance of Transaction:-",contractBalance);
    } )
});