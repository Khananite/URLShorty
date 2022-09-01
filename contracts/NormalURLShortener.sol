// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interfaces/IURLShortener.sol";

contract NormalUrlShortener is IURLShortener
{	
	uint private _lastLinkId;
	mapping (uint => LinkTemplate) public linkMapping;

	//mapping and array used to check if url for the current user exists.
	//Address => url.
	mapping(address => string[]) usersStoredUrls;

    constructor()
	{
  		_lastLinkId = 0;
 	}
	
	//Storing data on the blockchain.
	function createNewUrlLink(string memory _url) public returns (uint)
	{
	    _lastLinkId++;
		linkMapping[_lastLinkId] = LinkTemplate(msg.sender, _url);
		usersStoredUrls[msg.sender].push(_url);
		emit ShortenedURLAdded(msg.sender, _lastLinkId, _url);
		return _lastLinkId;
	}
	
	function doesUsersUrlExist(address userAddress, string memory _url) view public returns (bool)
	{
		string[] memory userUrls = usersStoredUrls[userAddress];
		for(uint i = 0; i < userUrls.length; i++)
		{
			if(keccak256(abi.encodePacked((userUrls[i]))) == keccak256(abi.encodePacked((_url))))
				return true;
		}
		return false;
	}
}