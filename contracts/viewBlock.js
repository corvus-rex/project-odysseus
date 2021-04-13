const Web3 = require('web3')
const abiDecoder = require('abi-decoder');
const abi = require('./abi_ballot.json')

const web3 = new Web3('http://127.0.0.1:7545');

const transaction = '0x98ca6eac8f7066c53ab28fe13fa952329c6c387ae9eb97e257cb7b6806ee77ef'
web3.eth.getTransaction(transaction, function(err, tx){
    abiDecoder.addABI(abi);
    let tx_data = tx.input;

    let decoded_data = abiDecoder.decodeMethod(tx_data);
    let params = decoded_data.params;

    let param_values = [];
    for(i in params){  // loop to print parameters without unnecessary info
      param_values.push(params[i].name + " : " + params[i].value);
    }
    console.log(decoded_data)
    console.log(param_values);
});