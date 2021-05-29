const Web3 = require('web3')
const abiDecoder = require('abi-decoder');
const abi = require('./abi_publication.json')

const web3 = new Web3('http://127.0.0.1:7545');

const transaction = '0x8efa72767c1f9c6d7d32bff031cb1eca72ae1d5b215e288cc7a00257b04465f1'
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