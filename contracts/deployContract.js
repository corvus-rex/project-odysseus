var solc = require("solc"); // import the solidity compiler
var fs = require("fs")

var code = fs.readFileSync("register.sol").toString();

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
console.log(output);

var abi = output.contracts.contract.Registration.abi;
fs.writeFileSync('abi_register.json', JSON.stringify(abi, null, "\t"));

var bytecode = output.contracts.contract.Registration.evm.bytecode;
fs.writeFileSync('bytecode_register.json', JSON.stringify(bytecode, null, "\t"));