// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IPurchaser
{
    //Event for when user purchases the url shorty product.
    event Purchased(address indexed from, address indexed to, uint amount);

    //Check if user has enough money to donate.
    //Deduct the amount from their account.
    //Add this amount to my smart contract.
    //Payable keyword because money will be send to the owner of the contract.
    //Return whether the purchase was successful or not, so I can transfer tokens to user.
    function purchaseUrlShorty(address _from, uint _productPrice, uint _dateOfPurchase)  external payable returns (bool);

    //The contract owner can move the donations from the contract to another address (e.g. their
    //metamask address).
    //function contractAmountTransfer() external;

    //Get the total amount earned.
    function getTotalAmountEarned() view external returns(uint);

    function hasUserPurchasedURLShorty(address _from) view external returns(bool);
}