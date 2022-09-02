//This javascript file is for interacting with the Purchaser and CustomToken contracts.

//When using web3.js in an Ethereum compatible browser, it will set with the current native provider by that browser. Will return the given provider by the (browser) environment, otherwise null.
//https://web3js.readthedocs.io/en/v1.2.11/web3.html#givenprovider
//Gives us the provider from our metamask, doesn't matter if it's a testnet, local node, etc, whichever we're connected to.
//So it will connect us to the Ethereum blockchain.
var web3 = new Web3(Web3.givenProvider);
var purchaserObject;
var customTokenObject;
var userWalletAddress;

$(function()
{
  initContracts();
});

async function initContracts()
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
        //purchaserAbi is a variable, which is stored in abiPurchaser.js
        purchaserObject = new web3.eth.Contract(purchaserAbi, purchaserContractAddress);
        //Give user custom token(s) after purchasing URL Shorty.
        customTokenObject = new web3.eth.Contract(customTokenAbi, customTokenContractAddress);
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
  document.getElementById("purchase_trial_button").addEventListener("click", async ( { target }) => {
    if (window.ethereum)
    {
      //Check user is connected to the Goerli testnet.
      checkMetaMaskNetwork();
      try
      {
        //Check if user has an account connected to metamask.
        if(userWalletAddress)
        {
          if(await purchaserObject.methods.hasUserPurchasedURLShorty(userWalletAddress).call() == true)
          {
            alert("No need for a free trial, you've already purchased URL Shorty. You'll now be redirected to the main page");
            window.location.href = 'urlShorty.html';
          }
          else
            freeTrial();
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("purchase_button").addEventListener("click", async ( { target }) => {
    
    if (window.ethereum)
    {
      //Check user is connected to the Goerli testnet.
      checkMetaMaskNetwork();
      try
      {
        //Check if user has an account connected to metamask.
        if(userWalletAddress)
        {
          if(await purchaserObject.methods.hasUserPurchasedURLShorty(userWalletAddress).call() == false)
          {
            var purchaseUrlShorty = await purchaseURLShortyProduct(userWalletAddress);
           
            //Before this step, nodejs listens to when the user purchases URL Shorty. Once nodejs captures the event, then custom tokens
            //are sent to the user.
            var transferCustomTokensToUser = await afterCustomTokenTransfer(userWalletAddress);
          }
          else
          {
            alert("You've already purchased URL Shorty. You'll now be redirected to the main page");
            window.location.href = 'urlShorty.html';
          }
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

async function purchaseURLShortyProduct(userAddress)
{
  $('#purchase_trial_button').prop('disabled', true);
  $('#purchase_button').prop('disabled', true);
  var productPrice = await purchaserObject.methods.getProductPrice().call();
  
  console.log(web3.utils.fromWei(productPrice.toString()));
  ///This calls Purchaser contract's method and calls metamask to transfer/purchase.
  //web3.utils.toWei - Covert the decimal ether to wei, since solidity can't handle decimals.
  var callMetaMaskForPurchase = await purchaserObject.methods.purchaseUrlShorty(userAddress, productPrice, convertCurrentDateToSeconds(Date.now()))
  .send({
    from: userAddress,
    value: productPrice
  }, function(error, txHash)
    {
        if(error)
        {
            alert("Unable to purchased URL Shorty - something went wrong");
            console.log("Error is: " + error);
            $('#purchase_trial_button').prop('disabled', false);
            $('#purchase_button').prop('disabled', false);
        }
        else
        {
          alert("Successfully purchased URL Shorty. Please wait for the transaction to be mined. This may take up to 30 seconds to complete.");
          console.log(txHash);
        }
    });
}

async function afterCustomTokenTransfer(userAddress)
{
  $('#purchase_trial_button').prop('disabled', false);
  $('#purchase_button').prop('disabled', false);
  await getTokenBalanceOf(userAddress).then( balance => { console.log(userAddress + " Token Balance: " + balance); });
  await addCustomTokensToUsersMetaMask();
  await customTokenTransferCompleted();  
}

async function getTokenBalanceOf(address)
{
  return await customTokenObject.methods.balanceOf(address).call();                        
}

async function customTokenTransferCompleted()
{
  //var tokenAmountToTransfer = await customTokenObject.methods.getTokenAmountToTransfer().call();
 //alert(`You have just received ${tokenAmountToTransfer} custom url shorty tokens. \nTo view your new tokens, please click 'Add Token'.

 alert(`You have just received custom url shorty tokens. \nTo view your new tokens, please click 'Add Token' on MetaMask.
  \nAlternatively, you can import them using this contract address: ${customTokenContractAddress}
  \nYou'll now be redirected to the main page`);
  location.href = 'urlShorty.html';
}

//Instead of the user getting the customToken smart contract's address and then importing the custom token
//to their metamask account, this code will import it into their account for them. They simply have to click the button 'Add Token'.
async function addCustomTokensToUsersMetaMask()
{
  var customtokenSymbol = await customTokenObject.methods.symbol().call();
  var customTokenImage = 'https://i.postimg.cc/kXBtrVh0/URLSHORTY-token.jpg';
  try
  {
    //wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: customTokenContractAddress, //The address that the token is at.
          symbol: customtokenSymbol, //A ticker symbol or shorthand, up to 5 chars.
          decimals: 0.5, //The number of decimals in the token - 0.5 decimals because that way the actual token amount is shown to the user, instead of decimals.
          image: customTokenImage, //A string url of the token logo. The custom token image is being hosted at this location.
        },
      },
    });
  
    if (wasAdded)
    {
      console.log('Custom tokens added to MetaMask');
    }
    else
    {
      console.log('Rejected importing custom tokens to MetaMask');
    }
  }
  catch (error)
  {
    console.log(error);
  }
}

//Close the ".metamask-not-connected-modal" when x button is pressed.
$(".close").on("click", function()
{
  $(".modal").removeClass("is-active");
});
