// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Pausable.sol";

contract CustomToken is ERC20Capped, Ownable, Pausable
{
    string constant private _tokenName = "URLSHORTY";
    string constant private _tokenSymbol = "URLS";
    uint private _tokenCap = 100000000000;
    uint private _tokenAmountToMint = 100000;
    uint private _tokenAmountToTransfer = 100;

    //Call the ERC20 and ERC20Capped constructors.
    //Because they still need to be called separately as
    //ERC20Capped.sol inherits ERC20.sol.
    constructor() ERC20(_tokenName, _tokenSymbol) ERC20Capped(_tokenCap)
    {
        //Call the mint function from within ERC20Capped.sol to create/mint tokens
        //for our contract so it can be used within Purchaser.sol contract to send
        //tokens to users after they've bought URL Shorty.
        _mint(msg.sender, _tokenAmountToMint);
    }
    
    function transfer(address to, uint256 amount) public virtual override whenNotPaused onlyOwner returns(bool)
    {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }
 
    //This is the amount to transfer to user after they've bought URL Shorty.
    function getTokenAmountToTransfer() public view returns(uint)
    {
        return _tokenAmountToTransfer;
    }

    function setTokenAmountToTransfer(uint _amount) public whenNotPaused onlyOwner
    {
        _tokenAmountToTransfer = _amount;
    }

    function getTokenCap() public view onlyOwner returns(uint) 
    {
        return _tokenCap;
    }

    function setTokenCap(uint _total) public whenNotPaused onlyOwner
    {
        _tokenCap = _total;
    }

    function getTokenAmountToMint() public view onlyOwner returns(uint) 
    {
        return _tokenAmountToMint;
    }

    function setTokenAmountToMint(uint _amount) public whenNotPaused onlyOwner
    {
        _tokenAmountToMint = _amount;
    }
}