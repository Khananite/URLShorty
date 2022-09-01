// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./interfaces/IPreviewURLShortener.sol";

contract PreviewURLShortener
{
    //Short url pointing to a long url.
	mapping(string => string) private _storedUrls;

    //returns (string memory _returnLongUrl)
    function addUrls(string memory _shortUrl, string memory _longUrl) public 
    {
        _storedUrls[_shortUrl] = _longUrl;
    }

	function getLongUrl(string memory _shortUrlEntered) public view  returns (string memory _longUrlReturned)
    {
        return _storedUrls[_shortUrlEntered];
    }
}