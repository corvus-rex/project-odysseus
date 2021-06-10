import Web3 from 'web3'
import networkURL from '../../contracts/networkURL.js'
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const userManagerABI = require("../../contracts/ABI/abi_usermanager.json")
const userManagerReceipt = require('../../contracts/receipts/receipt_usermanager.json')

export function registerUser(username, publicKey) {
     
    var abi = userManagerABI
    var receipt = userManagerReceipt
    var contractAddress = receipt.contractAddress
    const web3 = new Web3(new Web3.providers.HttpProvider(networkURL.networkURL))
    web3.eth.getAccounts().then((accounts) => {
        var userManagerContract = new web3.eth.Contract(abi, contractAddress, {
            from: accounts[0]
        })
        if(!web3.utils.isAddress(publicKey)){
            console.log('invalid public address')
        }
        userManagerContract.methods.newUser(username, publicKey).send({
            from: accounts[0],
            gasPrice: 1,
            gas: 200000
        }).on('receipt', (receipt) => {
            console.log(receipt)
        }).on('error', err => console.log(err))
    })
}