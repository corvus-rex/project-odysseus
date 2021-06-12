<template>
    <div>
    <Nav :appName= "appName" />
    <b-card 
    style="max-width: 40rem;" 
    title="Submit a New Flag" 
    class="mt-5 ml-4">
      <b-form @submit.stop.prevent="onSubmit">
        <b-form-group label="Flag Subject" label-for="flag-subject">
          <b-form-input
            id="flag-subject"
            v-model="flagSubject"
            required
            placeholder="What does your flag concern?"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Flag Writeup" label-for="flag-writeup">
          <b-form-textarea
            id="flag-writeup"
            v-model="flagWriteup"
            required
            rows="8"
            placeholder="Explain about the news article's violation of Policy of Conduct"
            class="mt-3"
          ></b-form-textarea>
        </b-form-group>
        <b-form-group label= "Submit Evidence of Violation (PDF, .doc, .docx and .txt only)" label-for="logo-input">
            <input
             id="logo-input"
             type="file" 
             accept=".pdf,.docx,.doc,.txt" 
             @change="uploadEvidence">
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="submitFlag">Submit</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import path from 'path'
import serverSide from '../serverSide'
import axios from 'axios'
import Web3 from 'web3'
import sha256 from 'js-sha256'
import networkURL from '../../../contracts/networkURL.js'
import newsroomManagerABI  from "../../../contracts/ABI/abi_newsroommanager.json"
import newsroomManagerReceipt from '../../../contracts/receipts/receipt_newsroommanager.json'
// import {registerPublisher} from '../contracts/callContract'

export default {
    name: 'FlagSubmission',
    data: () => {
        return {
            appName: appName,
            user: {},
            flagSubject: '',
            flagWriteup: '',
            flagEvidence: null,
            flagIndex: 0,
            publicationID: '',
            publication: {}
        }
    },
    components: {
        Nav
    },
    methods: {
        uploadEvidence(event) {
            this.flagEvidence = event.target.files[0]
            console.log(this.flagEvidence)
        },
        getPublication() {
          this.publicationID = this.$route.query.id
          axios.post(serverSide.getPublication, {publicationID: this.publicationID})
          .then((res) => {
            this.publication = res.data.publication[0]
          })
        },
        submitFlag() {
            var hashedContent = sha256.create()
            hashedContent.update(this.flagWriteup)
            let address = window.ethereum.selectedAddress
            let web3 = new Web3(
              new Web3.providers.HttpProvider(networkURL.networkURL))
            let newsroomManagerContract = new web3.eth.Contract(
              newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                from: address
              }
            )
            newsroomManagerContract.methods.submitFlag(
              this.flagSubject,
              hashedContent.hex(),
              this.publication.chainID,
              7200
            ).send({
                from: address,
                gasPrice: 1,
                gas: 300000
            }).on('receipt', receipt => {
              console.log(receipt)
              var chainID = receipt.events.FlagCreated.returnValues.flagID
              var formData = new FormData()
              formData.append('flagSubject', this.flagSubject)
              formData.append('flagWriteup', this.flagWriteup)
              formData.append('userID', this.user._id)
              formData.append('username', this.user.username)
              formData.append('publicationID', this.publicationID)
              formData.append('filename', this.flagEvidence.name)
              formData.append('flagIndex', this.flagIndex)
              formData.append('chainID', chainID)
              formData.append('flagEvidence', this.flagEvidence)
              console.log("Filename: ", this.flagEvidence.name)
              console.log("MIME Type: ", this.flagEvidence.type)
              console.log("Extension Name: ", path.extname(this.flagEvidence.name))
              console.log(formData)
              axios({
                  method: "POST",
                  url: serverSide.submitFlag,
                  data: formData,
                  headers: {"Content-type": "multipart/form-data"}
              })
              .then((res) => {
                console.log(res.data.publication)
                this.$router.push({name: "news", query:{id: this.publicationID}})
              })
              .catch(function (error) {
                  console.error(error.response);
              });
            }).on('error', err => {
              console.log(err)
            })
        }
    },
    created: async function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.user = userParsed
        this.publicationID = this.$route.query.id
        this.flagIndex = this.$route.query.flagIndex
        await this.getPublication()
    }
}
</script>