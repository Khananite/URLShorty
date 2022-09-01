// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IURLShortener
{
	//Indexed address so I can use it as a filter on the front end to only return 'ShortenedURLAdded' events
	//from the current user's address: https://ethereum.stackexchange.com/questions/74412/filters-object-not-working-for-web3-eth-contract-getpastevents-method
	event ShortenedURLAdded(address indexed from, uint linkId, string url);

	struct LinkTemplate
	{
		address userAddress;
		string url;
	}
	
	function createNewUrlLink(string memory _url) external returns (uint);
	function doesUsersUrlExist(address userAddress, string memory _url) view external returns (bool);
	
}