// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interfaces/IPausable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Pausable is IPausable, Ownable
{
    bool private _paused;

    constructor()
    {
        _paused = false;
    }

    //Modifier to make a function callable only when the contract is not paused.
    modifier whenNotPaused()
    {
        //The contract should not be paused.
        require(!_paused, "Paused contract");
        _;
    }

    //Modifier to make a function callable only when the contract is paused.
    modifier whenPaused()
    {
        //The contract should be paused.
        require(_paused, "Not paused contract");
        _;
    }

    //Only the owner of the contract can pause the contract.
    //Only pause the contract when the contract is not paused.
    function pause() public onlyOwner whenNotPaused
    {
        _paused = true;
    }

    //Only the owner of the contract can pause the contract.
    //Only un-pause the contract when the contract is paused.
    function unPause() public onlyOwner whenPaused
    {
        _paused = false;
    }
}