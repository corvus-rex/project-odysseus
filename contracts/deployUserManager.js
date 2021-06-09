var solc = require("solc"); // import the solidity compiler
var fs = require("fs");
var Web3 = require('web3')
var networkURL = require('./networkURL')

var code = fs.readFileSync("UserManager.sol").toString();

var solcInput = {
    language: "Solidity",
    sources: { 
        contract: {
            content: code
        }
     },
    settings: {
        optimizer: {
            enabled: true
        },
        evmVersion: "istanbul",
        outputSelection: {
            "*": {
              "": [
                "legacyAST",
                "ast"
              ],
              "*": [
                "abi",
                "evm.bytecode.object",
                "evm.bytecode.sourceMap",
                "evm.deployedBytecode.object",
                "evm.deployedBytecode.sourceMap",
                "evm.gasEstimates"
              ]
            },
        }
    }
};

var output = JSON.parse(solc.compile(JSON.stringify(solcInput)));

var abi = output.contracts.contract.UserManager.abi;
fs.writeFileSync('ABI/abi_usermanager.json', JSON.stringify(abi, null, "\t"));

var bytecode = output.contracts.contract.UserManager.evm.bytecode;
fs.writeFileSync('bytecodes/bytecode_usermanager.json', JSON.stringify(bytecode, null, "\t"));

const web3 = new Web3(new Web3.providers.HttpProvider(networkURL.networkURL))
web3.eth.getAccounts().then( (accounts) => {
  var account = accounts[0]
  var userManagerContract = new web3.eth.Contract(abi);
  var bc = bytecode.object;
  var userManager = userManagerContract.deploy({
      data: bc, 
      arguments: [
      ]
  }).send({
    from: account, 
    gas: '4700000'
  })
  .on('error', function(error){ console.log(error) })
  .on('transactionHash', function(transactionHash){ console.log(transactionHash) })
  .on('receipt', function(receipt){
    console.log(receipt)
    fs.writeFileSync('receipts/receipt_usermanager.json', JSON.stringify(receipt, null, "\t"));
  })
});