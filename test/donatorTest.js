const Donator = artifacts.require("Donator");
const truffleAssert = require('truffle-assertions');

contract("Donator", function ([owner, donor1, donor2])
{
    let donator;

    //beforeEach function which will run before each test creating a new instance of donator each time.
    beforeEach('setup contract for each test', async function () {
        donator = await Donator.new()
    })

    it('has an owner', async function () {
        assert.equal(await donator.owner(), owner)
    })

    it("should be able to donate funds larger than 0", async () => {
       // let account1 =  accounts[1];
        let dateOfDonation = 30;
        
        //Should not be possible to donate 0 wei.
        await truffleAssert.reverts(
            //First parameter is the address and msg.value. Using the below first parameter is a way of 
            //using/setting the value of msg.value.
            donator.donate(donor1, dateOfDonation, {value: 0}) //Place {value: 0} at the end otherwise error:  AssertionError: Expected to fail with revert, but failed with: Error: Invalid number of parameters for "donate". Got 3 expected 2!
        )

        await truffleAssert.passes(
            donator.donate(donor1, dateOfDonation, {value: 10})
        )
    })

    it("should be able to refund donation(s)", async () => {
      //  let account1 =  accounts[1];
        let dateOfDonation = 30;
        let deadlineDayRefund = 25;
        let donationTimesToRefund = 2;

        //Should not be possible for user to refund donations without donating in the first place.
        await truffleAssert.reverts(
            donator.refund(donor1, deadlineDayRefund , dateOfDonation)
        )

        await donator.donate(donor1, dateOfDonation, {value: 30})
        await donator.donate(donor1, dateOfDonation, {value: 50})

        //should not be posslbe to refund more donations than they have made.
        await truffleAssert.reverts(
            donator.refund(donor1, deadlineDayRefund , 3)
        )

        //Should not be possible to refund donations past the deadline day.
        await truffleAssert.reverts(
            donator.refund(donor1, 40 , 3)
        )

        await truffleAssert.passes(
            donator.donate(donor1, donationTimesToRefund, {value: 10})
        )
    })

    xit("should be able to refund 1 donation, but not 2 of them (because one of them is past the refund deadline)", async () => {
        //let account2 =  accounts[2];
        let dateOfDonation = 30;
        let deadlineDayRefund = 25;
        let donationTimesToRefund = 2;

        await donator.donate(donor2, dateOfDonation, {value: 30})
        //The donation I won't be able to refund, because the deadline day for refunding has passed.
        await donator.donate(donor2, 20, {value: 50})

        let amount = await donator.refund(donor2, deadlineDayRefund , donationTimesToRefund);
        
        assert.strictEqual(amount.toString(), "Refunded: 1 donation(s). Not all donations you have made are refundable. See list below:");
        
        let nonRefundableDonations = await donator.getNonRefundableDonations();
        assert.strictEqual(nonRefundableDonations.length, 1)
    })

    it('is able to pause and unpause Donator contract activity', async function () {
        await donator.pause()

        //Revert because contract is paused.
        await truffleAssert.reverts(
            donator.donate(donor2, 20, {value: 50})
        )

        await donator.unPause()

        await truffleAssert.passes(
            donator.donate(donor2, 20, {value: 50})
        )
    })
})