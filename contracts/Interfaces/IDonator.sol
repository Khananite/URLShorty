// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IDonator
{
    event Donated(address indexed _from, address indexed _to, uint _amountDonated);
 
    //Add the donation amount & when the donation was made to my smart contract.
    //Payable keyword because money will be send to the owner of the contract.
    //Return whether the donation was successful.
    function donate(address _from, uint _dateOfDonation) external payable returns(bool);

    function getTotalDonations() view external returns(uint);
}