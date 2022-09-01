// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interfaces/IPurchaser.sol";
import "./interfaces/IRefunder.sol";
import "./Pausable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Purchaser is IPurchaser, IPurchaseRefunder, Ownable, ReentrancyGuard, Pausable
{
    //Contract creator's address.
    //All addresses that will accept payment or make payment must be of the payable type.
    address payable private _contractOwner;

    //0.2 eth in wei.
    //When setting the price, the decimal ether will need to be converted to wei, since solidity can't handle decimals.
    uint private _price = 200000000000000000;

    //The total amount of eth made from purchases.
    uint private _purchaseBalance;

    //This struct stores user's purchase amount (we store this because the price of the product could change in the future) 
    //& the datetime they purchsed (datetime will be used for refunding within the specified deadline day (e.g. 30 days)).
    //This struct is like a value tuple in c#. I got this from: https://stackoverflow.com/questions/69386723/solidity-send-array-of-tuple-data-with-address-and-amount
    struct _purchase
    {
        uint purchaseAmount;
        uint dateOfPurchase;
    }

    //Mapping that points the user's address to their purchase.
    //This mapping will also be used for refunds.
    mapping (address => _purchase) private _usersPurchase;

    uint private _userCount;
    
    constructor()
    {
        //Setting the contract's creator.
        _contractOwner = payable(msg.sender);

    }

    //Use openzeppelin's ReentrancyGuard.sol (nonReentrant modifier) to prevent reentrancy attacks.
    function purchaseUrlShorty(address _from, uint _productPrice, uint _dateOfPurchase) public payable nonReentrant whenNotPaused returns (bool)
    {
        //Check if user has already purchased.
        require(hasUserPurchasedURLShorty(_from) == false, "You've already purchased this product");        

        //owner.call{value: msg.value}("") to make a payment to owner of contract, where 
        //productPrice is the value of url shorty.
        //Then we get the call return to check if the transfer was successful using require.
        //Call() is now the recommended way of sending Ether from a smart contract (preferable over transfer() & send()).
        (bool success,) = _contractOwner.call{ value: _productPrice }("");

        //If the purchase wasn't completed, return an error message.
        require(success, "Failed to send money");

        _purchase memory _userPurchase = _purchase (
            _productPrice,
            _dateOfPurchase
        );

        //Store purchase in the mapping.
        _usersPurchase[_from] = _userPurchase;

        //Add purchase amount to total purchase amount.
        _purchaseBalance += _productPrice;

        _userCount++;

        emit Purchased(_from, _contractOwner, _productPrice);

        return success;
    }

    //Use the push-pull pattern to safeguard against potential issues.
    //Use openzeppelin's ReentrancyGuard.sol (nonReentrant modifier) to prevent reentrancy attacks.
    //Use checks-effects-interactions pattern to further prevent any potential reentrancy attack.
    function refund(address payable _to, uint _deadlineDayRefund) public payable nonReentrant whenNotPaused returns(string memory message)
    {
        //Let user refund their purchase within the specified deadline day (e.g. 30 days).

        //////////////////Checks:

        _purchase memory _tempUserPurchase = _usersPurchase[_to];

        //require: Check if user made a purchase.
        require(_tempUserPurchase.purchaseAmount != 0, "You haven't made a purchase");
  

        //Check if the purchase they made they want refunded was made within the last x days (e.g. 30 days).
        //block.timestamp: refers to the time when the block was created and verified. They also warn most developers to keep in mind that block.timestamp can be influenced by the miners.
        //timestamp – the time when the block was mined: https://ethereum.org/en/developers/docs/blocks/#block-anatomy      

        uint _purchaseAmountToRefund = 0;
       
        //If the purchase was not made within the specified deadline time frame.
        if(_tempUserPurchase.dateOfPurchase < (block.timestamp - _deadlineDayRefund))
        {
            return string.concat("Your refund was not made within: ", Strings.toString(_deadlineDayRefund), " days of your purchase");
        }
        else
        {
            _purchaseAmountToRefund += _tempUserPurchase.purchaseAmount;
        }

        //https://programtheblockchain.com/posts/2018/01/12/writing-a-contract-that-handles-time/
        //Google: "check if purchase was made in last 30 days solidity".

        //////////////////Effects:
        //Remove user and their purchase from the mapping
        delete  _usersPurchase[_to];

        //Remove the purchase made from the overall purchase amount.
        _purchaseBalance -= _purchaseAmountToRefund;

        //Interactions: Send purchase refund back to user.
        (bool success,) = _to.call{ value: _purchaseAmountToRefund }("");

        //If the refund wasn't successful, return an error message.
        require(success, "Failed to refund donations");

        emit Refunded(_contractOwner, _to, _purchaseAmountToRefund);

        return "Purchase refunded successfully.";
    }

    function hasUserPurchasedURLShorty(address _from) view public returns(bool)
    {
        //Return true if user has purchased.
        return _usersPurchase[_from].purchaseAmount > 0 ? true: false;
    }

    function getTotalAmountEarned() view public returns(uint)
    {
        //I can also use msg.sender.balance to get the contract's balance.
        return _purchaseBalance;
    }

    function getUserCount() view public returns(uint)
    {
        return _userCount;
    }

    function getProductPrice() view public returns(uint)
    {
        return _price;
    }

    function setProductPrice(uint _productPrice) public onlyOwner whenNotPaused
    {
        _price = _productPrice;
    }
}