//There are two versions of web3 API, old one (used by metamask) and new one (used by lastest web3 from nodejs).
//So I need to access events differently.

//This file is for signing and sending/adding the short and long urls.
//The code listens to an event. It listens to the most recent event where the user shortened their entered url, once that event is captured.
//The function, addUrls(), will add the urls to the PreviewUrlShortener contract. This will be used for previewing the shortened url i.e.
//it will be used to retrieve the long url from the short url in previewShortenedUrl.html and previewUrlShortenedInteractor.js. 

const fs = require('fs');
require('../client_side/assets/js/Extras/formatAppender.js')
var normalUrlShortenerContractAddress = require('../client_side/ContractsAddresses/jsonAddresses/contractAddresses.json').normalUrlShortenerContractAddress;
var previewUrlShortenerContractAddress = require('../client_side/ContractsAddresses/jsonAddresses/contractAddresses.json').previewUrlShortenerContractAddress;
const websocket = require('../secrets.json').Websocket;
const goerli_api_key = require('../secrets.json').Goerli_API_KEY;
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(websocket + goerli_api_key));
const LO = require('../secrets.json').Location_origin;
const PK = require('../secrets.json').Private_key;

var previewUrlShortenerObject;
var normalUrlShortenerObject;

async function addUrlsToPreviewUrl()
{
    initContracts();
    userShortensUrlEvent();
}

async function initContracts()
{
    try
    {
        const normalUrlShortenerAbi = fs.readFileSync("../client_side/assets/js/Abis/jsonAbis/abiNormalUrlShortener.json");
        const previewUrlShortenerAbi = fs.readFileSync("../client_side/assets/js/Abis/jsonAbis/abiPreviewUrlShortener.json");

        const normalAbi = JSON.parse(normalUrlShortenerAbi);
        const previewAbi = JSON.parse(previewUrlShortenerAbi);

        normalUrlShortenerObject = new web3.eth.Contract(normalAbi, normalUrlShortenerContractAddress);
        previewUrlShortenerObject = new web3.eth.Contract(previewAbi, previewUrlShortenerContractAddress);
    }
    catch(error)
    {
        if (error.code === 4001)
        {
          console.log('Error: ' + error.code);
        }
    }
}

//Listen to the recently shortened url event that was emitted.
async function userShortensUrlEvent()
{
    await normalUrlShortenerObject.events.ShortenedURLAdded().on('data', function(event)
    {
        var shortUrl = '{0}/s?id={1}'.f(LO, event.returnValues.linkId);
        addUrls(shortUrl, event.returnValues.url);
    });
}

async function addUrls(shortUrl, enteredUrl)
{
  //Create the data for adding urls transaction.
  var transactionData = await previewUrlShortenerObject.methods.addUrls(shortUrl, enteredUrl).encodeABI();
  var rawTransaction = {"to": previewUrlShortenerContractAddress, "gas": 100000, "data": transactionData};

  //Sent from personal account, so I don't have to recall metamask for another transaction.
  web3.eth.accounts.signTransaction(rawTransaction, PK)
    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    .then(req =>
    { 
        //The trx was done. Write your actions here. For example, getBalance.
        getLongUrl(shortUrl).then( longUrl => { console.log("Long url is: " + longUrl); });
        return true;  
    })
}

async function getLongUrl(shortUrl)
{
    return await previewUrlShortenerObject.methods.getLongUrl(shortUrl).call();                        
}

addUrlsToPreviewUrl();