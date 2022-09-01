// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//Created a separate interface for the refund event because both interfaces below will implement and use the same event.
interface IRefunderEvent
{
    event Refunded(address indexed _from, address indexed _to, uint _amount);
}

interface IDonationRefunder is IRefunderEvent
{
    //Arg 1: Address to refund to. Arg 2: The days user can refund within i.e. 30 day refund.
    //Arg 3: _donationTimes denotes the amount of donations the user wants refunded. If they've made 2 donations, and they want
    //to refund both of their donations, then _donationTimes = 2
    //Return string status whether all the donations the user wanted to get refunded were possible.
    function refund(address payable _to, uint _deadlineDayRefund, uint _donationTimes) external payable returns(string memory message);
}

interface IPurchaseRefunder is IRefunderEvent
{
    function refund(address payable _to, uint _deadlineDayRefund) external payable returns(string memory message);
}
