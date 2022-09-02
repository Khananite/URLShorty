**URL Shorty (URL shortener) - Ethereum based dApp:** https://urlshorty.co.uk

**Features:**
1. User can purchase the product (the ability to shorten URLs), they must have MetaMask installed and connected to the Goerli testnet, or the user can have a 1 hour free trial. When the user clicks the "Buy" button, MetaMask is called, and the user signs and sends the transaction.
2. After user purchases, they recieve 100 custom URL shorty tokens directly to their MetaMask account. This task is completed by a node.js file, which listens to when the purchase occurs (I emit an event when users purchase), and I capture this event in the node.js backend and sign a transfer using my own account details, that way users can receive custom tokens without needing to sign the transaction.
3. User can donate, but they must install MetaMask and be connected to the Goerli testnet (one of ethereum's testnets).
4. User can shorten a long URL, and view the transaction in etherscan. Each new URL shortened is emitted as an event in the smart contract.
5. User can view their shortened URLs in their dashboard. This is completed through retrieving all past URLs the user has shortened, through past events.
6. User, and other individuals, can preview the shortened URL. Meaning, they can retrieve the long URL from the shortened URL by going to "preview.html" of the dApp and entering the short URL.
7. Users can click their shortened URL and be redirected to their destination site: When the users clicks on the shortened URL another transaction is made requesting the blockchain which URL string is located at the provided reference. This is done through an express.js app where the short url is captured, the long url is retrieved and the user is redirected.
Since this transaction is not changing the state of the blockchain, we do not need to pay any ETH this time, the user is seamlessly redirected to the long URL.

**Tools/software/languages used:**
1. Front-end: html, css, vue.js (for dropdown nav bar when resizing screen), web3.js, jquery, javascript
2. Smart contract: Solidity, openzeppelin library.
3. Back-end: node.js (node.js was used for listening to events emitted from the front-end, captured on the back-end, for tasks like sending custom tokens to users without manual signing of transactions), web3.js. Express.js for capturing the short url the user enters into their browser, then retrieving the long url, and redirecting the user.
4. Network: Goerli testnet (Goerli was chosen because Rinkeby and Ropsten will be deprecated in Q3/Q4 of 2022).
5. Additional: Truffle (to deploy contracts, and as truffle tests), ganache (local blockchain).

**There are 4 parts/sections to this DApp:**
1. Front end/UI
2. Smart contracts
3. Node.js app: For sending custom tokens to user, without needing manual signing of the transfer/transaction.
4. Express.js app: For Capturing the shortened url the user enters into the browser, and retrieving the long url from a smart contract, and then redirecting the user to their long url destination.
