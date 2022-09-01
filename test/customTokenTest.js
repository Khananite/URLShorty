const CustomToken = artifacts.require("CustomToken");
const truffleAssert = require('truffle-assertions');

contract("CustomToken", function ([owner, toAddress])
{
    let token;

    //beforeEach function which will run before each test creating a new instance of CustomToken each time.
    beforeEach('setup contract for each test', async function () {
        token = await CustomToken.new()
    })

    it('has an owner', async function () {
        assert.equal(await token.owner(), owner)
    })

    it("should be able to transfer tokens to another address", async () => {
        let tokenAmountToTransfer = await token.getTokenAmountToTransfer()

        await truffleAssert.passes(
            token.transfer(toAddress, tokenAmountToTransfer)
        )
    })

    it("should be able to set token amount to transfer", async () => {
        let tokenAmountToTransfer = 100;

        await token.setTokenAmountToTransfer(tokenAmountToTransfer);
        var customTokenAmount = await token.getTokenAmountToTransfer();

        assert.equal(customTokenAmount, tokenAmountToTransfer)
     })

     it("should be able to set token cap", async () => {
        let tokenCap = 100000;

        await token.setTokenCap(tokenCap);
        let customTokencap = await token.getTokenCap();

        assert.equal(customTokencap, tokenCap)
     })

     it("should be able to set token amount to mint", async () => {
        let tokenAmountToMint = 1000;
        await token.setTokenAmountToMint(tokenAmountToMint);
        let customTokenAmountToMint = await token.getTokenAmountToMint();

        assert.equal(customTokenAmountToMint, tokenAmountToMint)
     })

    it('is able to pause and unpause CustomToken contract activity', async function () {
        let tokenAmountToTransfer = 100;
        await token.pause()

        //Revert because contract is paused.
        await truffleAssert.reverts(
            token.transfer(toAddress, tokenAmountToTransfer)
        )
        
        await token.unPause()
        var customTokenAmount = await token.getTokenAmountToTransfer()

        await truffleAssert.passes(
            token.transfer(toAddress, customTokenAmount)
        )
    })
})