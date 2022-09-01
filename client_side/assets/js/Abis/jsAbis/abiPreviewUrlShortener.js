var previewUrlShortenerAbi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shortUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_longUrl",
        "type": "string"
      }
    ],
    "name": "addUrls",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shortUrlEntered",
        "type": "string"
      }
    ],
    "name": "getLongUrl",
    "outputs": [
      {
        "internalType": "string",
        "name": "_longUrlReturned",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];