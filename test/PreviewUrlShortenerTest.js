const PreviewURLShortener = artifacts.require("PreviewURLShortener");
const NormalURLShortener = artifacts.require("NormalURLShortener");
const truffleAssert = require('truffle-assertions');

contract("PreviewURLShortener", function ([userAccount])
{
    let previewURLShortener;
    let normalURLShortener;

    //beforeEach function which will run before each test creating a new instance of PreviewURLShortener each time.
    beforeEach('setup contract for each test', async function () {
        previewURLShortener = await PreviewURLShortener.new()
    })

    //beforeEach function which will run before each test creating a new instance of donator each time.
     beforeEach('setup contract for each test', async function () {
        normalURLShortener = await NormalURLShortener.new()
    })

    it('should return long url from shortened url', async function () {
        let enteredUrl = "http://127.0.0.1:3000/client_side/URLShorty.html";

        await normalURLShortener.createNewUrlLink(enteredUrl, {from: userAccount})

        //Listening to blockchain events. And retrieve the event emitted and its data.
        //Subscribe to event calling listener when the event occurs.
        var longUrlReturned = await normalURLShortener.contract.events.ShortenedURLAdded().on('data', function(event)
        {
            var shortUrl = '{0}/s?id={1}'.f('http://127.0.0.1:3000/s?', event.returnValues.linkId)
            
            previewURLShortener.addUrls(shortUrl, enteredUrl).send({from: userWalletAddress})

            var getLongurl =  previewURLShortener.getLongUrl(shortUrl).call()
            assert.equal(getLongurl, "http://127.0.0.1:3000/s?id=1");
        });
    })
})