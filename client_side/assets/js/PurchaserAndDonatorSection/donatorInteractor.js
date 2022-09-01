//This javascript file is for interacting with the Donator contract.

//When using web3.js in an Ethereum compatible browser, it will set with the current native provider by that browser. Will return the given provider by the (browser) environment, otherwise null.
//https://web3js.readthedocs.io/en/v1.2.11/web3.html#givenprovider
//Gives us the provider from our metamask, doesn't matter if it's a testnet, local node, etc, whichever we're connected to.
//So it will connect us to the Ethereum blockchain.
var web3 = new Web3(Web3.givenProvider);
var donatorObject;
var userWalletAddress;

$(function()
{
  initDonatorContract();
});

async function initDonatorContract()
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
  
        //Create new instance of the Donator smart contract.
        //donatorAbi is a variable, which is stored in abiDonator.js
        donatorObject = new web3.eth.Contract(donatorAbi, donatorContractAddress, {from: userWalletAddress});
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
  document.getElementById("donate_button").addEventListener("click", async ( { target }) => {
    
    if (window.ethereum)
    {
      //Check user is connected to the Goerli testnet.
      checkMetaMaskNetwork();
      try
      {        
        //Check if user has an account connected to metamask.
        if(userWalletAddress)
        {
          //Display donation popup slider to let user set the donation amount.
          $(".donation-slider-modal").addClass("is-active");
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

//Once the "donate" button on the donation slider is clicked.
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("donationAmount_button").addEventListener("click", async ( { target }) => {

    //Get the value of the donation slider the user chose i.e. user's donation amount.
    var donationAmount = document.getElementById("donation-amount").value;

    if(donationAmount >= 0.1)
    {
      //Close the ".donation-slider-modal".
      $(".modal").removeClass("is-active");
      
      //Await before doing the next line (await lets the below line run first, which involves metamask transfers, before moving on to the next code line).
      var donation = await donate(userWalletAddress, donationAmount);

      //Refresh the page.
      window.location.reload();
    }
    else
      alert("You must donate at least 0.1 ETH.");
  })
}
)

async function donate(userAddress, donationAmount)
{
  //This calls the Donator contract's method and calls metamask to transfer/donate.
  var callMetaMaskForDonation = await donatorObject.methods.donate(userAddress, convertCurrentDateToSeconds(Date.now())).send({
    from: userAddress,
    value: web3.utils.toWei(donationAmount, 'ether')
  }, function(error, txHash)
    {
        if(error)
        {
            alert("Unable to donate - something went wrong");
            console.log("Error is: " + error);
        }
        else
        {
          alert("Donation has been sent succesfully! Please wait for transaaction to be mined. This may take up to 30 seconds.");  
          console.log(txHash);
        }
    });
    const response = await donatorObject.methods.getTotalDonations().call();
    console.log(`Total amount donated is ${web3.utils.fromWei(response)} ETH.`);

}

//Close the ".metamask-not-connected-modal" when x button is pressed.
$(".close").on("click", function()
{
    $(".modal").removeClass("is-active");
});