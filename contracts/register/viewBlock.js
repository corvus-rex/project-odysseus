const Web3 = require('web3')
const abiDecoder = require('abi-decoder');
const abi = require('./abi_register.json')

const web3 = new Web3('http://127.0.0.1:7545');

const transaction = '0x89e015a7c08dd4beed5f5170d48fad217f9bff6f0c74926dc10b6d627bec0209'
web3.eth.getTransaction(transaction, function(err, tx){
    console.log(tx)
    abiDecoder.addABI(abi);
    let tx_data = tx.input;

    let decoded_data = abiDecoder.decodeMethod(tx_data);
    let params = decoded_data.params;

    let param_values = [];
    for(i in params){  // loop to print parameters without unnecessary info
      param_values.push(params[i].name + " : " + params[i].value);
    }
    console.log(decoded_data);
    console.log(transaction)
    console.log(param_values);
});