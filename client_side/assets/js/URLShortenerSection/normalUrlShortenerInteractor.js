//This javascript file is for interacting with the NormalUrlShortener contract.

//Gives us the provider from our metamask, doesn't matter if it's a testnet, local node, etc, whichever we're connected to.
//So it will connect us to the Ethereum blockchain.
var web3 = new Web3(Web3.givenProvider);

var normalUrlShortenerObject;
var purchaserObject;
var userWalletAddress;

$(function() 
{
    $("#spinner").hide();
    initNormalUrlShortenerContract();
})

async function initNormalUrlShortenerContract()
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
      
      purchaserObject = await new web3.eth.Contract(purchaserAbi, purchaserContractAddress);

      if(document.cookie == 1)
      {
        trialTimer();
      }
      //Redirect user back to index.html page if they haven't purchased URL Shorty.
      else if((userWalletAddresses.length == 0 && document.cookie == false) || await purchaserObject.methods.hasUserPurchasedURLShorty(userWalletAddress).call() == false)
        window.location = 'index.html';

      //Check if user has an account connected to metamask.
      if(userWalletAddresses.length > 0)
      {
        userWalletAddress = userWalletAddresses[0];

        //Create new instance of the NormalURLShortener smart contract.
        //normalUrlShortenerAbi is a variable, which is stored in abiNormalUrlShortener.js
        normalUrlShortenerObject = new web3.eth.Contract(normalUrlShortenerAbi, normalUrlShortenerContractAddress);
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submitLongUrl_button").addEventListener("click", async ( { target }) => {
    
    if (window.ethereum)
    {
      //Check user is connected to the Goerli testnet.
      checkMetaMaskNetwork();
      try
      {        
        //Check if user has an account connected to metamask.
        if(userWalletAddress)
        {
          shortenUrl();
        }
        else
        {         
          $(".metamask-not-connected-modal").addClass("is-active");  
          console.log('Not connected to metamask');
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
  })
}
)

async function shortenUrl()
{
  enteredUrl = document.getElementById("inputted-url").value;
  
  //Basic checks on the url the user entered/didn't enter.
  if(!enteredUrl)
  {
    return alert("Please enter a URL");
  }
  if(!isUrlValid(enteredUrl))
  {
    return alert("Invalid URL");
  }

  //Firstly check if the entered url already exists on the blockchain.
  //I placed all the code in the else, rather than outside the 'doesUsersUrlExist' promise because there was no other way to display if a 
  //url exists. Because before, it would display alert 'url exists' but then still do the metamask transaction 'createNewUrlLink(enteredUrl)'.
  await normalUrlShortenerObject.methods.doesUsersUrlExist(userWalletAddress, enteredUrl).call().then((urlExists) => 
  {
    if(urlExists == true)
    {
      alert("Url entered already has been shortened. Please check your dashboard.");
    }
    else
    {
    
      $("#info").html(""); 
      $("#spinner").show();
      $('#submitLongUrl_button').prop('disabled', true);

      //var createNewLinkTx = createNewUrlLink(enteredUrl);

      normalUrlShortenerObject.methods.createNewUrlLink(enteredUrl).send({from: userWalletAddress}, function(error, txHash)
      {
        if(error)
        {
          alert("Unable to shorten url - something went wrong");
          $('#submitLongUrl_button').prop('disabled', false);
          $("#info").html("");
          $("#spinner").hide();
          console.log(error);
        }
        //Place the code below in an else statement because when it's outside the else statement, the transaction hash (txHash) is undefined.
        else
        {
          displayShortenedUrl(enteredUrl, txHash);
        }
      });
    }
  });
}

function shortUrlCreator(linkId)
{
  return '{0}/s?id={1}'.f(location.origin, linkId);
}

function displayShortenedUrl(enteredUrl, txHash)
{
  alert("Url has been shortened succesfully!");
  console.log(txHash);
  $("#info").prepend( "<p>Waiting for transaction to be mined. This may take up to 30 seconds</p><br>" );

  //Listening to blockchain events. And retrieve the event emitted and its data.
  //Subscribe to event calling listener when the event occurs.
  normalUrlShortenerObject.events.ShortenedURLAdded().on('data', function(event)
  {
    if(event.returnValues.url !== enteredUrl)
    {
        console.log('Not my event');
        return
    }
    
    $("#info").html( "<p>Transaction confirmed</p> <a target='_blank' href='https://Goerli.etherscan.io/tx/{0}'>view tx on blockchain</a><br>".f(txHash) );
    var shortUrl = shortUrlCreator(event.returnValues.linkId);
    $("#info").prepend( "Short URL: <a target='_blank' href='{0}'>{0}</a><br>".f(shortUrl) );
    $("#info").append( "<b>The newly created short URL may take up to 1-2 minutes to work</b>" );
    console.log("EVENT LISTENER", shortUrl, event.returnValues.linkId, event.returnValues.url);
    $("#spinner").hide();
    $('#submitLongUrl_button').prop('disabled', false);

    //Append the dashboard to include the newly created short url.
    var shorterUrl = shortUrl.replace('https://','');
    var row = "\
      <tr>\
        <td><p class='smaller'>{0}</p></td>\
        <td style='min-width:133px'><a class='small' target='_blank' href='{1}'><strong>{2}</strong></a></td>\
        <td><a target='_blank' href='https://Goerli.etherscan.io/block/{3}'><code>{3}</code></a></td>\
        <td><a target='_blank' href='https://Goerli.etherscan.io/tx/{4}'>link</a></td>\
      </tr>".f(enteredUrl, shortUrl, shorterUrl, event.blockNumber, txHash);
    $("#url-dashboard").prepend(row);
  }); 
}

async function doesUrlExist(enteredUrl)
{
  await normalUrlShortenerObject.methods.doesUsersUrlExist(userWalletAddress, enteredUrl).call().then((result) => 
  { 
    if(result == true)
    {
      alert("Url entered already has been shortened. Please check your dashboard.");
      location.reload();
    }
  });
}

function trialTimer()
{
  //Redirect user back to home page back after 60 minutes.
  setTimeout(function()
  {
    window.location = "index.html";
  }, 3600000); //60 minutes in milliseconds (60 x 60 x 1000 - i.e. 60 seconds x 60 minutes x 1000 milliseconds)
}

$(".close").on("click", function()
{
    $(".transactions-modal").addClass("is-active");
});