//There are two versions of web3 API, old one (used by metamask) and new one (used by lastest web3 from nodejs).
//So I need to access events differently.

//This file is for signing and sending custom tokens to the user without needing to manually sign the transaction/transfer.
//The code listens to an event. It listens to the most recent event where the user purchased URL Shorty, once that event is captured.
//The function, transferCustomTokens(), will transfer the custom tokens to the user. 

const fs = require('fs');
var purchaserContractAddress = require('../client_side/ContractsAddresses/jsonAddresses/contractAddresses.json').purchaserContractAddress;
var customTokenContractAddress = require('../client_side/ContractsAddresses/jsonAddresses/contractAddresses.json').customTokenContractAddress;
const websocket = require('../secrets.json').Websocket;
const goerli_api_key = require('../secrets.json').Goerli_API_KEY;
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(websocket + goerli_api_key));
const PK = require('../secrets.json').Private_key;
var purchaserObject;
var customTokenObject;

async function transferTokens()
{
    initContracts();
    userPurchasedEvent();
}

async function initContracts()
{
    try
    {
        const purchaserContractAbi = fs.readFileSync("../client_side/assets/js/Abis/jsonAbis/abiPurchaser.json");
        const customTokenContractAbi = fs.readFileSync("../client_side/assets/js/Abis/jsonAbis/abiCustomToken.json");

        const purchaserAbi = JSON.parse(purchaserContractAbi);
        const customTokenabi = JSON.parse(customTokenContractAbi);

        purchaserObject = new web3.eth.Contract(purchaserAbi, purchaserContractAddress);
        customTokenObject = new web3.eth.Contract(customTokenabi, customTokenContractAddress);
    }
    catch(error)
    {
        if (error.code === 4001)
        {
            console.log('Error: ' + error.code);
        }
    }
}

//Listen to the recently purchased URL Shorty event that was emitted.
async function userPurchasedEvent()
{
    purchaserObject.events.Purchased().on('data', function(event)
    {
        transferCustomTokens(event.returnValues.from);
    });
}

//I need to sign the transaction for my CustomToken smart contract to be able to transfer tokens automatically to the user from my CustomToken smart contract/wallet.
async function transferCustomTokens(userWalletAddress)
{
    var tokenAmountToTransfer = await customTokenObject.methods.getTokenAmountToTransfer().call();

    //Create the data for token transaction.
    var transactionData = await customTokenObject.methods.transfer(userWalletAddress, "100").encodeABI();
    var rawTransaction = {"to": customTokenContractAddress, "gas": 100000, "data": transactionData};

    web3.eth.accounts.signTransaction(rawTransaction, PK)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(req =>
        {
            //The trx was done. Write your actions here. For example, getBalance.
            getTokenBalanceOf(userWalletAddress).then( balance => { console.log(userWalletAddress + " Token Balance: " + balance); }); 
            return true;  
        })   
}

async function getTokenBalanceOf(address){
    return await customTokenObject.methods.balanceOf(address).call();                        
}

transferTokens();