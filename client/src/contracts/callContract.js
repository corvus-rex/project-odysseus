import Web3 from 'web3'
import registrationABI from "../../../contracts/register/abi_register.json"
import registrationReceipt from '../../../contracts/register/receipt_register.json'
import publicationABI from "../../../contracts/publication/abi_publication.json"
import publicationReceipt from '../../../contracts/publication/receipt_publication.json'

export function registerPublisher(pubName, publicKey) {
    
    var abi = registrationABI
    var receipt = registrationReceipt
    var contractAddress = receipt.contractAddress
    console.log(contractAddress)
    window.web3 = new Web3(window.ethereum)
    var inWei = Web3.utils.toWei('1', 'ether')
    console.log(inWei)
    var registrationContract = new window.web3.eth.Contract(abi, contractAddress, {
        from: publicKey,
        gasPrice: 21000,
    })
    registrationContract.methods.registerPublisher(pubName).send({
        from: publicKey,
        gasPrice: 21000,
        value: inWei
    }).on('receipt', (receipt) => {
        console.log(receipt)
    })
}

export function publishDraft(authors, draftID, hash, approverKey) {
    
    var abi = publicationABI
    var receipt = publicationReceipt
    var contractAddress = receipt.contractAddress
    window.web3 = new Web3(window.ethereum)
    var publicationContract = new window.web3.eth.Contract(abi, contractAddress, {
        from: approverKey,
        gasPrice: 21000,
    })
    publicationContract.methods.publish(authors, draftID, hash).send({
        from: approverKey,
        gasPrice: 21000
    }).on('receipt', (receipt) => {
        console.log(receipt)
    })
}

export function newRevision(authors, publicationID, hash, lastVers, approverKey) {
    
    var abi = publicationABI
    var receipt = publicationReceipt
    var contractAddress = receipt.contractAddress
    window.web3 = new Web3(window.ethereum)
    var publicationContract = new window.web3.eth.Contract(abi, contractAddress, {
        from: approverKey,
        gasPrice: 21000,
    })
    publicationContract.methods.revise(authors, publicationID, hash, lastVers).send({
        from: approverKey,
        gasPrice: 21000
    }).on('receipt', (receipt) => {
        console.log(receipt)
    })
}