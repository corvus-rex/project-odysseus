import Web3 from 'web3'
import networkURL from '../../contracts/networkURL.js'
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const registrationABI = require("../../contracts/register/abi_register.json")
const registrationReceipt = require('../../contracts/register/receipt_register.json')

export function registerUser(email, publicKey) {
     
    var abi = registrationABI
    var receipt = registrationReceipt
    var contractAddress = receipt.contractAddress
    const web3 = new Web3(new Web3.providers.HttpProvider(networkURL.networkURL))
    web3.eth.getAccounts().then((accounts) => {
        var registrationContract = new web3.eth.Contract(abi, contractAddress, {
            from: accounts[0]
        })
        if(!web3.utils.isAddress(publicKey)){
            console.log('invalid public address')
        }
        registrationContract.methods.newUser(email, publicKey).send({
            from: accounts[0]
        }).on('receipt', (receipt) => {
            console.log(receipt)
        })
    })
    
}

export function electAuthorship(chiefOfficer, newAuthor) {
     
    var abi = registrationABI
    var receipt = registrationReceipt
    var contractAddress = receipt.contractAddress
    const web3 = new Web3(new Web3.providers.HttpProvider(networkURL.networkURL))
    web3.eth.getAccounts().then((accounts) => {
        var registrationContract = new web3.eth.Contract(abi, contractAddress, {
            from: accounts[0]
        })
        if(!web3.utils.isAddress(newAuthor)){
            console.log('invalid public address')
        }
        registrationContract.methods.electAuthorship(chiefOfficer, newAuthor).send({
            from: accounts[0]
        }).on('receipt', (receipt) => {
            console.log(receipt)
        })
    })
    
}