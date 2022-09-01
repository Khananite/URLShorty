//This javascript file is for retrieving and displaying user's recently shortened urls.

var web3 = new Web3(Web3.givenProvider);
var normalUrlShortenerObject;

$(function()
{
  retrieveDashboardEvents();
});

//Batch listening of events.
async function retrieveDashboardEvents()
{
  const userWalletAddresses = await ethereum.request({method: 'eth_accounts'});
  normalUrlShortenerObject = new web3.eth.Contract(normalUrlShortenerAbi, normalUrlShortenerContractAddress);

  //Receives all occurrences of when the "ShortenedURLAdded" event was emitted from this smart contract.
  await normalUrlShortenerObject.getPastEvents('ShortenedURLAdded', 
  {
    //Only get the current user's emitted events for the 'ShortenedURLAdded' event.
    //I use toChecksumAddress() to convert the address to uppercase, because getting the address from metamask converts the address to lowercase,
    //but when emitting the address to the event, the address is uppercase. This is a simplistic explanation.
    //https://web3js.readthedocs.io/en/v1.2.11/web3-utils.html#tochecksumaddress
    filter: { from: web3.utils.toChecksumAddress(userWalletAddresses[0]) },
    fromBlock: 0,               
    toBlock: 'latest'

  }, function(error, events)
  {
  })
  .then(function(events)
  {
    if (events.length)
    {
      for (var i = 0; i < events.length; i++)
      {
        var shortUrl = '{0}/s?id={1}'.f(location.origin, events[i].returnValues.linkId);
        var row = "\
          <tr>\
            <td><p class='smaller'>{0}</p></td>\
            <td style='min-width:133px'><a class='small' target='_blank' href='{1}'><strong>{2}</strong></a></td>\
            <td><a target='_blank' href='https://Goerli.etherscan.io/block/{3}'><code>{3}</code></a></td>\
            <td><a target='_blank' href='https://Goerli.etherscan.io/tx/{4}'>link</a></td>\
          </tr>".f(events[i].returnValues.url, shortUrl, shortUrl, events[i].blockNumber, events[i].transactionHash);
        //console.log(row);
        $("#url-dashboard").prepend(row);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dashboard_button").addEventListener("click", async ( { target }) => {
    $(".dashboard-modal").addClass("is-active");
  })
}
)