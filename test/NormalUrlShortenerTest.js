const NormalURLShortener = artifacts.require("NormalURLShortener");
const truffleAssert = require('truffle-assertions');

contract("NormalURLShortener", function ([userAccount])
{
    let normalURLShortener;

    //beforeEach function which will run before each test creating a new instance of donator each time.
    beforeEach('setup contract for each test', async function () {
        normalURLShortener = await NormalURLShortener.new()
    })

    it('should shorten a new entered long url', async function () {
        let enteredUrl = "http://127.0.0.1:3000/client_side/URLShorty.html";

        await normalURLShortener.createNewUrlLink(enteredUrl, {from: userAccount})
        
        //Url exists.
        await truffleAssert.passes(
            normalURLShortener.doesUsersUrlExist(userAccount, enteredUrl)
        )

        //Listening to blockchain events. And retrieve the event emitted and its data.
        //Subscribe to event calling listener when the event occurs.
        var shortenedUrl = await normalURLShortener.contract.events.ShortenedURLAdded().on('data', function(event)
        {
            var shortenedUrl = '{0}/s?id={1}'.f('http://127.0.0.1:3000/s?', event.returnValues.linkId);
            assert.equal(shortenedUrl, "http://127.0.0.1:3000/s?id=1");
        });
        
    })
})