<template>
    <div>
    <Nav :appName= "appName" />
    <b-card 
    style="max-width: 40rem;" 
    title="Register New Publisher" 
    class="mt-5 ml-4"
    v-if="!hasPublisher">
      <b-form @submit.stop.prevent="onSubmit" v-if="!hasPublisher">
        <b-form-group label="Publisher Name" label-for="name-input">
          <b-form-input
            id="name-input"
            v-model="pubName"
            required
            placeholder="Enter the new publisher name"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label= "Publisher Logo" label-for="logo-input">
            <input
             id="logo-input"
             type="file" 
             accept="image/*" 
             @change="uploadImage">
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="handleRegister">Register</b-button>
        </div>
      </b-form>
    </b-card>
    <b-card 
    style="max-width: 40rem;" 
    title="This user is already a registered Chief Officer!" 
    class="mt-5 ml-4"
    v-else>
    </b-card>
  </div>
</template>

<script>
import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import userManagerABI  from "../../../contracts/ABI/abi_usermanager.json"
import userManagerReceipt from '../../../contracts/receipts/receipt_usermanager.json'

import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'

export default {
    name: 'RegisterPublisher',
    data: () => {
        return {
            appName: appName,
            userID: '',
            pubName: '',
            publicKey: '',
            logo_data: null,
            hasPublisher: false
        }
    },
    components: {
        Nav
    },
    methods: {
        uploadImage(event) {
            this.logo_data = event.target.files[0]
        },
        handleRegister() {
            if (typeof window.ethereum !== 'undefined') {
              window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            else {
              alert('Please install MetaMask!')
              return
            }
            var address = window.ethereum.selectedAddress
            const web3 = new Web3(
              new Web3.providers.HttpProvider(networkURL.networkURL))
            var userManagerContract = new web3.eth.Contract(
              userManagerABI, userManagerReceipt.contractAddress, {
                from: address
              }
            )
            userManagerContract.methods.registerPublisher(this.pubName).send({
                from: address,
                gasPrice: 1,
                gas: 200000
            }).on('receipt', (receipt) => {
              console.log(receipt)
              var formData = new FormData()
              formData.append('name', this.pubName)
              formData.append('chiefOfficer', this.userID)
              formData.append('filename', this.logo_data.name)
              formData.append('logo', this.logo_data)
              axios({
                  method: "POST",
                  url: serverSide.registerPublisher,
                  data: formData,
                  headers: {"Content-type": "multipart/form-data"}
              })
              .then((resp) => {          
                  localStorage.removeItem('user')
                  const user = resp.data.user
                  const userJSON = JSON.stringify(user)
                  localStorage.setItem('user', userJSON)
                  this.$router.push({name: "profile"})
              })
              .catch(function (error) {
                  console.error(error.response);
              });
            }).on('error', err => {
                console.log(err)
            })
        }
    },
    created: function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.userID = userParsed._id
        this.publicKey = userParsed.publicKey
        this.hasPublisher = userParsed.hasPublisher
    }
}
</script>