import Web3 from 'web3'
import networkURL from '../../contracts/networkURL.js'
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const registrationABI = require("../../contracts/register/abi_register.json")
const registrationReceipt = require('../../contracts/register/receipt_register.json')

function registerUser(email, publicKey) {
     
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

export function revokeAuthorship(chiefOfficer, author) {
     
    var abi = registrationABI
    var receipt = registrationReceipt
    var contractAddress = receipt.contractAddress
    const web3 = new Web3(new Web3.providers.HttpProvider(networkURL.networkURL))
    web3.eth.getAccounts().then((accounts) => {
        var registrationContract = new web3.eth.Contract(abi, contractAddress, {
            from: accounts[0]
        })
        if(!web3.utils.isAddress(author)){
            console.log('invalid public address')
        }
        registrationContract.methods.revokeAuthorship(chiefOfficer, author).send({
            from: accounts[0]
        }).on('receipt', (receipt) => {
            console.log(receipt)
        })
    })
    
}

registerUser('adrianovdex@gmail.co', '0x56BE696748bC54eade182720531E82D3730957bC')