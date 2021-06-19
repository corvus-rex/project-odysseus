const Web3 = require('web3')
const abiDecoder = require('abi-decoder');
const abi = require('./ABI/abi_newsroommanager.json')

const web3 = new Web3('http://127.0.0.1:7545');

const transaction = '0x7705c0c835040ac3b16e29557746ac85d1143643ab83080878805aed88a7c018'
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