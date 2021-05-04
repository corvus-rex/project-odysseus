import Web3 from 'web3'
import registrationABI from "../../../contracts/register/abi_register.json"
import registrationReceipt from '../../../contracts/register/receipt_register.json'

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