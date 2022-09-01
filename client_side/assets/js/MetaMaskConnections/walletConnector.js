//If the user has connected to metamask, retrieve their account address and display it.
$(document).ready( async function()
{
        //Check whether user has an address connected to metamask.
        //'eth_accounts' returns an array that is either empty or contains a single account address.
        //The "currently selected" address is the first item in the array returned by 'eth_accounts'.
        //https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
        connectWallet('eth_accounts');
});

//If the user hasn't connected to their metamask account, they can click the button to connect to their metamask account.
//Check if connect_wallet button is clicked.
document.addEventListener("DOMContentLoaded", () =>
{
    document.getElementById("connect_wallet").addEventListener("click", async ( { target }) =>
    {
        /*
        Connect to MetaMask by calling[window.ethereum.request({ method: "eth_requestAccounts" });](https://docs.metamask.io/guide/rpc-api.html#eth-requestaccounts).
        Calling this function will open up MetaMask in the browser, whereby the user will be prompted to connect their wallet to your dapp.
        */
        connectWallet('eth_requestAccounts');

        //Check user is connected to the Goerli testnet.
        await checkMetaMaskNetwork();
    })
}
)

async function connectWallet(ethRequestType)
{
    if (window.ethereum)
    {
        try
        {
            const walletAddresses = await window.ethereum.request({method: ethRequestType});
          
            //If the user has a wallet address returned/connected.
            if(walletAddresses[0])
            {  
              
              var walletAddress = walletAddresses[0];

              //Display users metamask wallet address id.
              var walletAddressId = document.getElementById("wallet_address");
              walletAddressId.innerText = "Connected: " + walletAddress;
              walletAddressId.style.color = "white";
              walletAddressId.removeAttribute("hidden")

              //Hide the connect_wallet button, so it doesn't overlap the metamask wallet address id being displayed.
              var connectWalletId = document.getElementById('connect_wallet');
              connectWalletId.style.visibility = 'hidden';

              if(ethRequestType == 'eth_requestAccounts')
                //Refresh the page.
                window.location.reload();
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