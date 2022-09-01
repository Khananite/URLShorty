// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IPreviewURLShortener
{
	function addUrls(string memory _shortUrl, string memory _longUrl) external returns (string memory _returnLongUrl);
	function getLongUrl(string memory _shortUrlEntered) view external returns (string memory _longUrlReturned);
}