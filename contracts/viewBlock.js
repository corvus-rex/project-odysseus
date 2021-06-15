const Web3 = require('web3')
const abiDecoder = require('abi-decoder');
const abi = require('./ABI/abi_newsroommanager.json')

const web3 = new Web3('http://127.0.0.1:7545');

const transaction = '0xab9300bd7f7d64e11fa35148e5f732ba1246806cabc1acd65a2031b869dd8743'
web3.eth.getTransaction(transaction, function(err, tx){
    console.log(tx)
    abiDecoder.addABI(abi);
    let tx_data = tx.input;

    let decoded_data = abiDecoder.decodeMethod(tx_data);
    console.log(decoded_data)
    let params = decoded_data.params;

    let param_values = [];
    for(i in params){  // loop to print parameters without unnecessary info
      param_values.push(params[i].name + " : " + params[i].value);
    }
    console.log(decoded_data);
    console.log(transaction)
    console.log(param_values);
});