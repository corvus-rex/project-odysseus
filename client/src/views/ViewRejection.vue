<template>
    <div>
    <Nav :appName= "appName" />
    <b-card :title="flag.subject" 
    class="mt-5 ml-4"
    style="max-width: 50rem;">
      <small class="text-muted">
        Submitted by: {{flag.flaggerUsername}} at {{flag.dateSubmitted}}
      </small> <br>
      <small class="text-muted">
        For Publication title: {{publication.title}}
      </small> <br>
      <p>{{flag.writeup}}</p>
    </b-card>
    <b-card 
    style="max-width: 40rem;" 
    title="Rejection" 
    class="mt-2 ml-4">
      <small class="text-muted">
        Submitted by: {{flag.counterFlag.submitter}} at
         {{flag.counterFlag.dateSubmitted}}
      </small> <br>
      <p>{{flag.counterFlag.writeup}}</p>
      <div class="vote-bar-content">
        <button class="vote-btn" @click="upvote()">
          <b-icon icon="chevron-up" 
          :variant="upvoteVariant()"></b-icon>
        </button>
        <span class="vote"> {{flag.counterFlag.rep}} </span>
        <button class="vote-btn" @click="downvote()" >
          <b-icon icon="chevron-down"
          :variant="downvoteVariant()"></b-icon>
        </button>
      </div>
    </b-card>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'
// import {registerPublisher} from '../contracts/callContract'
import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import newsroomManagerABI  from "../../../contracts/ABI/abi_newsroommanager.json"
import newsroomManagerReceipt from '../../../contracts/receipts/receipt_newsroommanager.json'

export default {
    name: 'ViewRejection',
    data: () => {
        return {
            appName: appName,
            user: {},
            publisher: {},
            publication: {},
            flag: {},
            counterFlagWriteup: "",
            rep: 0,
            upvoted: false,
            downvoted: false,
            isAuthors: true
        }
    },
    components: {
        Nav
    },
    methods: {
      getPublisher() {
        axios.post(serverSide.getPublisher, {
          userID: this.user._id, userRole: this.user.role
        })
        .then((res) => {
          this.publisher = res.data.publisher
          console.log(this.publisher)
          this.getPublication()
        })
      },
      getPublication() {
        axios.post(serverSide.getPublication, {
          publicationID: this.$route.params.publicationID
        })
        .then((res) => {
          this.publication = res.data.publication[0]
          console.log(this.publication)
          this.getFlag()
        })
      },
      getFlag() {
        axios.post(serverSide.getFlag, {
          publicationID: this.publication._id,
          flagID: this.$route.params.flagID
        })
        .then((res) => {
          this.flag = res.data.flag
          this.rep = res.data.flag.counterFlag.rep
          this.upvoted = this.isUpvoted()
          this.downvoted = this.isDownvoted()
          console.log(this.flag)
          console.log("Rep: ", this.rep, " Upvoted: ", this.upvoted, 
          " Downvoted: ", this.downvoted)
        })
      },
      isUpvoted() {
        try {
          console.log("Already upvoted")
          return this.flag.counterFlag.upvoted.includes(this.user._id)
        }
        catch {
          return false
        }
      },
      isDownvoted() {
        try {
          console.log("Already downvoted")
          return this.flag.counterFlag.downvoted.includes(this.user._id)
        }
        catch {
          return false
        }
      },
      async upvote() {
        await this.isAuthorsGet()
        if (this.user != null) {
          axios.post(serverSide.findUserByID, {userID: this.user._id})
          .then((res) => {
            this.user.rep = res.data.user.rep
            if (this.upvoted == true) {
              alert('You have already voted!')
              return
            }
            else if (this.downvoted == true) {
              alert('You have already voted!')
              return
            }
            else if (this.isAuthors == true) {
              alert('Authors of the same publisher is not allowed to vote this news!')
              return
            }
            else if (this.user.rep <= 0) {
              alert('Your reputation score is not enough to vote!')
              return
            }
            else if (this.user.rep > 10) {
              let votingPower = 10
              let address = window.ethereum.selectedAddress
              let web3 = new Web3(
                new Web3.providers.HttpProvider(networkURL.networkURL))
              let newsroomManagerContract = new web3.eth.Contract(
                newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                  from: address
                }
              )
              newsroomManagerContract.methods.upvoteCF(
                this.flag.chainID
              ).send({
                  from: address,
                  gasPrice: 1,
                  gas: 300000
              }).on('receipt', receipt => {
                console.log(receipt)
                axios.post(serverSide.castVoteCF, {
                  voterID: this.user._id,
                  votingPower: votingPower,
                  publicationID: this.publication._id,
                  flagID: this.flag._id,
                  submitterID: this.flag.counterFlag.submitter
                })
                .then(() => {
                  this.rep += votingPower
                  this.upvoted = true
                  alert("Vote Casted")
                  this.$router.go()
                })
              }).on('error', err => {
                console.log(err)
              })
            }
            else if (this.user.rep < 10) {
              let votingPower = this.user.rep
              let address = window.ethereum.selectedAddress
              let web3 = new Web3(
                new Web3.providers.HttpProvider(networkURL.networkURL))
              let newsroomManagerContract = new web3.eth.Contract(
                newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                  from: address
                }
              )
              newsroomManagerContract.methods.upvoteCF(
                this.flag.chainID
              ).send({
                  from: address,
                  gasPrice: 1,
                  gas: 300000
              }).on('receipt', receipt => {
                console.log(receipt)
                axios.post(serverSide.castVoteCF, {
                  voterID: this.user._id,
                  votingPower: votingPower,
                  publicationID: this.publication._id,
                  flagID: this.flag._id,
                  submitterID: this.flag.counterFlag.submitter
                })
                .then(() => {
                  this.rep += votingPower
                  this.upvoted = true
                  alert("Vote Casted")
                  this.$router.go()
                })
              }).on('error', err => {
                console.log(err)
              })
            }
          })
        }
        else {
          this.$router.push({name: 'login'})
        }
      },
      async downvote() {
        if (this.user != null) {
          await this.isAuthorsGet()
          axios.post(serverSide.findUserByID, {userID: this.user._id})
          .then((res) => {
            this.user.rep = res.data.user.rep
            if (this.upvoted == true) {
              alert('You have already voted!')
              return
            }
            else if (this.downvoted == true) {
              alert('You have already voted!')
              return
            }
            else if (this.isAuthors == true) {
              alert('Authors of the same publisher is not allowed to vote this news!')
              return
            }
            else if (this.user.rep < 0) {
              alert('Your reputation score is not enough to vote!')
              return
            }
            else if (this.user.rep > 10) {
              var votingPower = -10
              let address = window.ethereum.selectedAddress
              let web3 = new Web3(
                new Web3.providers.HttpProvider(networkURL.networkURL))
              let newsroomManagerContract = new web3.eth.Contract(
                newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                  from: address
                }
              )
              newsroomManagerContract.methods.downvoteCF(
                this.flag.chainID
              ).send({
                  from: address,
                  gasPrice: 1,
                  gas: 300000
              }).on('receipt', receipt => {
                console.log(receipt)
                axios.post(serverSide.castVoteCF, {
                  voterID: this.user._id,
                  votingPower: votingPower,
                  publicationID: this.publication._id,
                  flagID: this.flag._id,
                  submitterID: this.flag.counterFlag.submitter
                })
                .then(() => {
                  this.rep += votingPower
                  this.upvoted = true
                  alert("Vote Casted")
                  this.$router.go()
                })
              }).on('error', err => {
                console.log(err)
              })
            }
            else if (this.user.rep < 10) {
              let votingPower = -this.user.rep
              let address = window.ethereum.selectedAddress
              let web3 = new Web3(
                new Web3.providers.HttpProvider(networkURL.networkURL))
              let newsroomManagerContract = new web3.eth.Contract(
                newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                  from: address
                }
              )
              newsroomManagerContract.methods.downvoteCF(
                this.flag.chainID
              ).send({
                  from: address,
                  gasPrice: 1,
                  gas: 300000
              }).on('receipt', receipt => {
                console.log(receipt)
                axios.post(serverSide.castVoteCF, {
                  voterID: this.user._id,
                  votingPower: votingPower,
                  publicationID: this.publication._id,
                  flagID: this.flag._id,
                  submitterID: this.flag.counterFlag.submitter
                })
                .then(() => {
                  this.rep += votingPower
                  this.upvoted = true
                  alert("Vote Casted")
                  this.$router.go()
                })
              }).on('error', err => {
                console.log(err)
              })
            }
          })
        }
        else {
          this.$router.push({name: 'login'})
        }
      },
      async isAuthorsGet() {
        if (this.user.hasPublisher == true) {
          await axios.post(serverSide.getPublisher, {
            userID: this.user._id, userRole: this.user.role
          })
          .then((res) => {
            console.log("Your News Publisher: ", res.data.publisher._id)
            console.log("Their News Publisher: ", this.publication.publisher)
              if (this.publication.publisher == res.data.publisher._id) {
                console.log("Same publishers")
                this.isAuthors = true
                console.log(this.isAuthors)
              }
              else {
                console.log("Different publishers")
                this.isAuthors = false
                console.log(this.isAuthors)
              }
            return
          })
        }
        else {
          this.isAuthors = false
        }
      },    
      upvoteVariant() {
        if (this.upvoted) {
          return 'warning'
        }
        else {
          return ''
        }
      },
      downvoteVariant() {
        if (this.downvoted) {
          return 'primary'
        }
        else {
          return ''
        }
      }
    },
    created: async function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.user = userParsed
        console.log("pubID", this.$route.params.publicationID)
        console.log("flagID", this.$route.params.flagID)
        await this.getPublisher()
    }
}
</script>

<style scoped>
  .vote-btn {
    border-style: none;
  }
</style>