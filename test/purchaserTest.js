const Purchaser = artifacts.require("Purchaser");
const truffleAssert = require('truffle-assertions');

contract("Purchaser", function ([owner, purchaser1, purchaser2])
{
    let purchaser;

    //beforeEach function which will run before each test creating a new instance of purchaser each time.
    beforeEach('setup contract for each test', async function () {
        purchaser = await Purchaser.new()
    })

    it('has an owner', async function () {
        assert.equal(await purchaser.owner(), owner)
    })

    it("should be able to Purchase product once for stated price", async () => {
        let productPrice = 40;
        let dateOfPurchase = 30;

        await truffleAssert.passes(
            purchaser.purchaseUrlShorty(purchaser1, productPrice, dateOfPurchase, {value: productPrice})
        )

        //Should not be possible for user to buy product again.
        await truffleAssert.reverts(
            purchaser.purchaseUrlShorty(purchaser1, productPrice, dateOfPurchase, {value: productPrice})
        )
    })

    it("should be able to refund purchase within deadline", async () => {
        let productPrice = 40;
        let dateOfPurchase = 30;
        let deadlineDayRefund = 25;

        //Should not be possible for user to refund purchase without purchasing in the first place.
        await truffleAssert.reverts(
            purchaser.refund(purchaser2, deadlineDayRefund)
        )
             
        await purchaser.purchaseUrlShorty(purchaser1, productPrice, 20, {value: productPrice})

        //Should not be possible to refund purchase past the deadline day.
        let refund1 = purchaser.refund(purchaser1, deadlineDayRefund)
        assert(refund1, "Your refund was not made within: " + deadlineDayRefund + "days of your purchase");

        await purchaser.purchaseUrlShorty(purchaser2, productPrice, dateOfPurchase, {value: productPrice})

        await truffleAssert.passes(
            purchaser.refund(purchaser2, deadlineDayRefund)
        )
    })

    it('is able to pause and unpause Purchaser contract activity', async function () {
        let productPrice = 40;
        await purchaser.pause()

        //Revert because contract is paused.
        await truffleAssert.reverts(
            purchaser.purchaseUrlShorty(purchaser2, productPrice, 20, {value: productPrice})
        )

        await purchaser.unPause()

        await truffleAssert.passes(
            purchaser.purchaseUrlShorty(purchaser2, productPrice, 20, {value: productPrice})
        )
    })
})