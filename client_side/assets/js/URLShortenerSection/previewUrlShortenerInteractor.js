//This javascript file is for interacting with the PreviewUrlShortener contract.

//Gives us the provider from our metamask, doesn't matter if it's a testnet, local node, etc, whichever we're connected to.
//So it will connect us to the Ethereum blockchain.
var web3 = new Web3(Web3.givenProvider);

var previewUrlShortenerObject;
var userWalletAddress;

$(function() 
{
  initPreviewUrlShortenerContract();
    $("#spinner").hide();
})

async function initPreviewUrlShortenerContract()
{
  if (window.ethereum)
  {
    try
    {
      //Check whether user has an address connected to metamask.
      //'eth_accounts' returns an array that is either empty or contains a single account address.
      //The "currently selected" address is the first item in the array returned by 'eth_accounts'.
      //https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
      const userWalletAddresses = await ethereum.request({method: 'eth_accounts'});
    
      //Check if user has an account connected to metamask.
      if(userWalletAddresses.length > 0)
      {
        userWalletAddress = userWalletAddresses[0];
  
        //Create new instance of the PreviewURLShortener smart contract.
        //previewUrlShortenerAbi is a variable, which is stored in abiPreviewUrlShortener.js
        previewUrlShortenerObject = new web3.eth.Contract(previewUrlShortenerAbi, previewUrlShortenerContractAddress);
      }
    }
    catch(error)
    {
      if (error.code === 4001)
      {
        console.log('User rejected ethereum accounts request');
      }
    }
  }
  else
  {
    console.log('window.ethereum not available');
  }
}

async function previewShortenedUrl()
{
  enteredShortUrl = document.getElementById("inputted-url").value;
  
  //Basic checks on the url the user entered/didn't enter.
  if(!enteredShortUrl)
  {
    return alert("Please enter a URL");
  }
  if(!isUrlValid(enteredShortUrl))
  {
    return alert("Invalid URL");
  }

  $("#info").html(""); 
  $("#spinner").show();
  $('#submitShortUrl_button').prop('disabled', true);
  
  var longUrl = await previewUrlShortenerObject.methods.getLongUrl(enteredShortUrl).call();

  if(!longUrl)
  {
    $("#spinner").hide();
    $('#submitShortUrl_button').prop('disabled', false);
    return alert("Short url doesn't exist.");
  }
  else
  {
    $("#info").prepend( "<p>Waiting for transaction to be retrieved</p><br>" );

    $("#info").html( "<p><b>Url retrieved<b/></p>" );

    $("#info").prepend( "Long URL: <a target='_blank' href='"+longUrl+"'>"+ longUrl + "</a><br>" );
    console.log("EVENT LISTENER", longUrl);
    $("#spinner").hide();
    $('#submitShortUrl_button').prop('disabled', false);
  }
}

