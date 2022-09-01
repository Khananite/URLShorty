// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interfaces/IDonator.sol";
import "./interfaces/IRefunder.sol";
import "./Pausable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Donator is IDonator, IDonationRefunder, ReentrancyGuard, Pausable
{
    //The total amount of money/crypto made from donations.
    uint private _donationsBalance;

    //Contract creator's address.
    //All addresses that will accept payment or make payment must be of the payable type.
     address payable private _contractOwner;

    //This struct stores user's donation amount & the datetime they donated (datetime will be used for refunding within the specified deadline day (e.g. 30 days)).
    //This struct is like a value tuple in c#. I got this from: https://stackoverflow.com/questions/69386723/solidity-send-array-of-tuple-data-with-address-and-amount
    struct _donation
    {
        uint donationAmount;
        uint dateOfDonation;
    }

    //Store any donations that are non-refundable because they were made more than x days ago (e.g. 30 days ago).
    struct _nonRefundableDonation
    {
        uint donationAmount;
        uint dayOfDonation;
    }

    //Store the amount of addresses/users who have donated.
    uint private _userCount;

    _nonRefundableDonation[] private _nonRefundableDonationsList;

    //This mapping is for each user donations they've made.
    //The users address points to an array of structs of donations & the datetime of the donations they've made in total.
    //This mapping will be used for refunds. I will specify how many donations the user
    //wants to refund (hence the need for the array).
    //Example, 4456x0 (address) => ((0.5 ETH, 01-01-22), (0.3 ETH, 02-03-22), (1 ETH, 05-05-22)) (donation amount, date of donation)
    mapping (address => _donation[]) private _usersDonations;

    //Return the index numbers of donations non-refundable, so we can remove them from the _usersDonations[_to] array.
    uint[] _indexesNonRefundable;

    //Store index of donations I can transfer, so we can remove them from the _usersDonations array.
    uint[] _donationIndexesTransferable;

    constructor()
    {
        //Setting the contract's creator.
        _contractOwner = payable(msg.sender);
    }
    
    //Use openzeppelin's ReentrancyGuard.sol (nonReentrant modifier) to prevent reentrancy attacks.
    function donate(address _from, uint _dateOfDonation) public payable nonReentrant whenNotPaused returns(bool)
    {
        require(msg.value != 0, "You cannot donate 0 amount");

        //owner.call{value: msg.value}("") to make a payment to owner of contract, where 
        //msg.value(global variable) is the value the user wants to send as a donation.
        //Then we get the call return to check if the transfer was successful using require.
        //Call() is now the recommended way of sending Ether from a smart contract (preferable over transfer() & send()).
        (bool success,) = _contractOwner.call{ value: msg.value }("");

        //If the donation wasn't completed, return an error message.
        require(success, "Failed to donate money");

         //Make sure this is a new user donating.
        if(_usersDonations[_from].length == 0)
            _userCount++;

        _donation memory donation = _donation (
            msg.value,
            _dateOfDonation
        );
        //Store donation in the mapping.
        _usersDonations[_from].push(donation);

        //Add donation amount to total donation amount.
        _donationsBalance += msg.value;

        emit Donated(_from, _contractOwner, msg.value);

        return success;
    }

    //Use the push-pull pattern to safeguard against potential issues.
    //Use openzeppelin's ReentrancyGuard.sol (nonReentrant modifier) to prevent reentrancy attacks.
    //Use checks-effects-interactions pattern to further prevent any potential reentrancy attack.
    function refund(address payable _to, uint _deadlineDayRefund, uint _donationTimes) public payable nonReentrant whenNotPaused returns(string memory message)
    {
        //Let user refund their donation(s) within the specified deadline day (e.g. 30 days).
        //Example, 4456x0 (address) => ((0.5 ETH, 01-01-22), (0.3 ETH, 02-03-22), (1 ETH, 05-05-22)) (donation amount, date of donation).
        //If the user wants to refund the last 2 donations, I check whether each donation
        //was made in the last x days (e.g. 30 days), if not then they can't get a refund.

        //////////////////Checks:

        //Store the state variable _usersDonations in a local memory variable, because it will consume less gas.
        //State variables are permanent and stored on the blockchain in contract storage. Therefore, if I were to interact with the state variable '_usersDonations'
        //it would consume more gas as I would be interacting with the blockchain.
        //I'm placing memory in front of my local variable because by default local array variables are stored in storage rather than memory
        //(other local variables are stored in memory, not arrays and structs).
        //See: https://moralis.io/how-to-reduce-solidity-gas-costs-full-guide/ and scroll to "Function C".
        _donation[] memory _tempUsersDonations = _usersDonations[_to];

        //require: Check if user made a donation.
        require(_tempUsersDonations.length != 0, "You haven't made any donations");

        //require: Check if the number of times they want their refund exists, so if they want the last 2
        //donations refunded, and they've only made 1 donation, then give an error.
        //Using string.concat because I can't combine two or more strings using a '+' symbol in solidity.
        require(_tempUsersDonations.length >= _donationTimes, string.concat("You've only donated ", Strings.toString(_tempUsersDonations.length), " time(s)"));
  

        //Check if each donation they made they want refunded was made within the last x days (e.g. 30 days).
        //block.timestamp: refers to the time when the block was created and verified. They also warn most developers to keep in mind that block.timestamp can be influenced by the miners.
        //timestamp – the time when the block was mined: https://ethereum.org/en/developers/docs/blocks/#block-anatomy      

        uint _donationAmountToRefund = 0;
        for(uint i = _tempUsersDonations.length - 1; i > 0 ; i--)
        {
            //If the donation was not made within the specified deadline time frame.
            if(_tempUsersDonations[i].dateOfDonation < (block.timestamp - _deadlineDayRefund))
            {
                //Add the donation that's non-refundable and return it in a separate function to display to the user.
                _nonRefundableDonation memory nonRefundableDonation  = _nonRefundableDonation
                (
                    _tempUsersDonations[i].donationAmount,
                    _tempUsersDonations[i].dateOfDonation
                );
                _nonRefundableDonationsList.push(nonRefundableDonation);
            }
            else
            {
                _indexesNonRefundable.push(i);
                 _donationAmountToRefund += _tempUsersDonations[i].donationAmount;
            }
        }

        //https://programtheblockchain.com/posts/2018/01/12/writing-a-contract-that-handles-time/
        //Google: "check if purchase was made in last 30 days solidity".

        //////////////////Effects:
        //Remove donations that were refundable from the mapping array.
        for(uint i = 0; i < _indexesNonRefundable.length; i++)
            delete _usersDonations[_to][_indexesNonRefundable[i]];

        //Remove the donations made from the overall donations amount.
        _donationsBalance -= _donationAmountToRefund;

        //Reset array.
        delete _indexesNonRefundable;

        //Interactions: Send donation refunds back to user.
        (bool success,) = _to.call{ value: _donationAmountToRefund }("");

        //If the refund wasn't successful, return an error message.
        require(success, "Failed to refund donations");

        emit Refunded(_contractOwner, _to, _donationAmountToRefund);
        
        if(_nonRefundableDonationsList.length > 0)
            return string.concat("Refunded: ", Strings.toString(_donationAmountToRefund), " donation(s). Not all donations you have made are refundable. See list below:");
        else
            return "All donations refunded successfully.";
    }

    //Return statement struct to specify whether any donation was not able to be refunded because it was made more than x days ago (e.g. 30 days ago).
    function getNonRefundableDonations() public returns(_nonRefundableDonation[] memory)
    {
        //Store in a local variable because I will empty the storage variable _nonRefundableDonationsList.
        _nonRefundableDonation[] memory nonRefundableDonationList = _nonRefundableDonationsList;

        delete _nonRefundableDonationsList;

        return nonRefundableDonationList;
    }

    function getTotalDonations() view public returns(uint)
    {
        //I can also use msg.sender.balance to get the contract's balance.
        return _donationsBalance;
    }

    function getUserCount() view public returns(uint)
    {
        return _userCount;
    }
}