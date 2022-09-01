//This file retrieves the short url the user enters into the browser/site's search bar, then calls the PreviewURLShortener.sol smart contract, which retrieves
//the long url from the short url and then this file redirects the user to the long url.

const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const fs = require('fs');
var previewUrlShortenerContractAddress = require('../client_side/ContractsAddresses/jsonAddresses/contractAddresses.json').previewUrlShortenerContractAddress;
const goerli = require('../secrets.json').Goerli;
const goerli_api_key = require('../secrets.json').Goerli_API_KEY;
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(goerli + goerli_api_key));

var previewUrlShortenerObject;

async function initContract()
{
    try
    {
        const previewUrlShortenerAbi = fs.readFileSync("../client_side/assets/js/Abis/jsonAbis/abiPreviewUrlShortener.json");
        const previewAbi = JSON.parse(previewUrlShortenerAbi);
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

async function getLongUrl(shortUrl)
{
    return await previewUrlShortenerObject.methods.getLongUrl(shortUrl).call();                        
}

app.set('view engine', 'ejs')

app.get('/:short', async function (req, res)
{
    var fullShortUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    initContract();
    let longUrlDestination = await previewUrlShortenerObject.methods.getLongUrl(fullShortUrl).call().then((result) => 
    { 
      if(result)
      {
          res.redirect(result)
      }
      else
      {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end("Failed. Link doesn't exist");
      }
    });
})

app.listen()