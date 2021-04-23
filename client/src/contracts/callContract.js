import Web3 from 'web3'
import registrationABI from "../../../contracts/register/abi_register.json"
import registrationReceipt from '../../../contracts/register/receipt_register.json'

export function registerPublisher(pubName, publicKey) {
    
    var abi = registrationABI
    var receipt = registrationReceipt
    var contractAddress = receipt.contractAddress
    window.web3 = new Web3(window.ethereum)
    var registrationContract = new window.web3.eth.Contract(abi, contractAddress, {
        from: publicKey
    })
    registrationContract.methods.registerPublisher(pubName).send({
        from: publicKey
    }).on('receipt', (receipt) => {
        console.log(receipt)
    })
}