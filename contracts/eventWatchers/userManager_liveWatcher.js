const Web3 = require('web3')
const networkURL = require('../networkURL')
const abiDecoder = require('abi-decoder');
const abi = require('../ABI/abi_usermanager.json');
const receipt = require('../receipts/receipt_usermanager.json');
const contractAddress = receipt.contractAddress;

const web3 = new Web3(new Web3.providers.WebsocketProvider(networkURL.websocketURL));
const contract = new web3.eth.Contract(abi, contractAddress);

console.log("Waiting for events...")
contract.events.allEvents()
.on('data', (event) => {
    console.log(event)
})
.on('error', console.error);