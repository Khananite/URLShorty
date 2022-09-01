function checkMetaMaskNetwork()
{
    //If the user is not connected to the Goerli testnet.
    if(window.ethereum.networkVersion != 5)
    {
        $(".metamask-network-modal").addClass("is-active");  
        console.log('Not connected to Goerli testnet.');
    }
}