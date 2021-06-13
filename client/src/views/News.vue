<template>
  <div>
    <Nav :appName= "appName" />
    <b-card 
    style="max-width: 70rem;" 
    :title="news.title" 
    class="mt-5 ml-4">
      <small class="text-muted">Written by: {{getAuthors}} at {{news.datePublished}}</small> <br>
      <small class="text-muted">Topic: {{news.topic}}</small> <br>
      <b-button id="flag-show" 
      variant="primary" v-b-modal.flag-modal
      class="mt-5">
       Display Flag Submissions </b-button>
      <b-button id="check-hash" 
      variant="primary"
      class="mt-5 ml-3"
      @click="checkHash()">
       Check Hash Validity </b-button>
      <div class="mt-5" v-html="news.article"/>
    </b-card>
    <b-modal id="flag-modal" title="Flag Submissions" hide-footer scrollable>
      <router-link :to="{name: 'flag-submission', query: {id: news._id, flagIndex: news.flags.length}}">
        <b-button class="mb-5" variant="primary">Submit new flag</b-button>
      </router-link>
      <b-list-group v-if="news.flags.length != 0">
        <b-list-group-item v-for="flag in news.flags" :key="flag">
          <b-row>
            <b-col>
              <h4 class="flag-subject">{{flag.subject}}</h4>
              <p class="flag-flagger"> Submitted by: @{{flag.flaggerUsername}} </p>
              <p class="flag-status"> Status: 
                <span :style="getStatusColor(flag)"> 
                  {{getStatus(flag)}}
                </span>
              <p class="flag-writeup"> {{flag.writeup}} </p>
            </b-col>
          </b-row>
          <div v-if="isAuthorsBool && flag.status === 'Pending'">
            <router-link 
            :to="{name: 'reject-flag', params: {
              publicationID: news._id, flagID: flag._id}}" 
            class="btn btn-danger">Reject</router-link>
            <router-link
            :to="{name: 'new-revision', query: {id: news._id, flagID: flag._id}}"
            class="btn btn-success">Accept</router-link>
          </div>
          <div v-if="flag.status === 'Rejected'">
            <router-link
            :to="{name: 'view-rejection', params: {
              publicationID: news._id, flagID: flag._id}}" 
            class="btn btn-primary">
            View Rejection</router-link>
          </div>
          <div v-if="flag.flaggerID === user._id">
            <b-button v-if="flagStatus[flag._id] === 'Ignored'" 
            id="claim-stake"
            variant="secondary"
            @click="claimStake(flag)">
              Claim Stake
            </b-button>
          </div>
        </b-list-group-item>
      </b-list-group>
      <p v-else>No flags to display</p>
    </b-modal>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'
import sha256 from 'js-sha256'

import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import newsroomManagerABI  from "../../../contracts/ABI/abi_newsroommanager.json"
import newsroomManagerReceipt from '../../../contracts/receipts/receipt_newsroommanager.json'

export default {
    name: 'news',
    data: () => {
        return {
            appName: appName,
            user: {},
            publisher: null,
            isAuthorsBool: false,
            newsID: "",
            news: {},
            flagStatus: {}
        }
    },
    components: {
        Nav
    },
    computed: {
      getAuthors() {
        var authorString = ''
        var idx = 0
        for (var i = 0; i < this.news.authors.length; i++) {
            authorString += this.news.authors[i].firstName
            authorString += " "
            authorString += this.news.authors[i].lastName
            if(idx != this.news.authors.length -1) {
                authorString += ", "
            }
            idx += 1
        }
        return authorString
      },
    },
    methods: {
      getPublication() {
        this.newsID = this.$route.query.id
        axios.post(serverSide.getPublication, {publicationID: this.newsID})
        .then((res) => {
          this.news = res.data.publication[0]
          console.log(this.news)
          this.isAuthors()
        })
      },
      isAuthors() {
        if (this.user != null) {
            axios.post(serverSide.getPublisher, {
              userID: this.user._id, userRole: this.user.role
            })
            .then((res) => {
                this.publisher = res.data.publisher
                if (this.news.publisher == this.publisher._id) {
                  this.isAuthorsBool = true
                  console.log("Is Authors?", this.isAuthorsBool)
                }
                else {
                  this.isAuthorsBool = false
                  console.log("Is Authors?", this.isAuthorsBool)
                }
            })
        }
      },
      getStatusColor(flag) {
        var now = Date.now().valueOf()
        var timeDiff = (now - Date.parse(flag.dateSubmitted)) / 1000
        if (flag.status == "Accepted") {
          return "color: green;"
        }
        else if (flag.status == "Rejected") {
          return "color: purple"
        }
        else if (timeDiff < flag.expirySeconds) {
          return "color: orange"
        }
        else {
          return "color: red"
        }
      },
      getStatus(flag) {
        var now = Date.now().valueOf()
        var timeDiff = (now - Date.parse(flag.dateSubmitted)) / 1000
        if (flag.status == "Accepted") {
          this.flagStatus[flag._id] = "Accepted"
          console.log(this.flagStatus)
          return "Accepted"
        }
        else if (flag.status == "Rejected") {
          this.flagStatus[flag._id] = "Rejected"
          console.log(this.flagStatus)
          return "Rejected"
        }
        else if (timeDiff < flag.expirySeconds) {
          this.flagStatus[flag._id] = "Pending"
          console.log(this.flagStatus)
          return "Pending"
        }
        else {
          this.flagStatus[flag._id] = "Ignored"
          console.log(this.flagStatus)
          return "Ignored"
        }
      },
      checkHash() {
        var toBeHashed = {
          title: this.news.title, 
          article: this.news.article, 
          description: this.news.description,
          publisher: this.news.publisher, 
          tags: this.news.tags, 
          locations: this.news.locations
        }
        console.log("To-be Hashed: ", toBeHashed)
        var stringifiedPublication = JSON.stringify(toBeHashed)
        var hashedArticle = sha256.create()
        hashedArticle.update(stringifiedPublication)
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        else {
          alert('Please install MetaMask!')
        }
        let address = window.ethereum.selectedAddress
        const web3 = new Web3(
          new Web3.providers.HttpProvider(networkURL.networkURL))
        var newsroomManagerContract = new web3.eth.Contract(
          newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
            from: address
          }
        )
        newsroomManagerContract.methods.getHash(
          this.news.chainID
        ).call(
          {from: address}
        ).then(function(res) {
          console.log(res)
          var thisHash = hashedArticle.hex()
          console.log('thisHash: ', thisHash)
          if (thisHash === res) {
            alert("This article hasn't been tampered\n ------------- \nLocal Hash: " 
            + thisHash + "\n" + "Blockchain Hash: " + res)
          }
          else {
            alert("This article has been tampered!\n ------------- \nLocal Hash: " 
            + thisHash + "\n" + "Blockchain Hash: " + res)
          }
        })
      }
    },
    created: async function() {
        try {
          var user = localStorage.getItem('user')
          this.user = JSON.parse(user)
        }
        catch {
          this.user = null
        }
        await this.getPublication()
    }
}
</script>

<style>
  .btn-primary {
      background-color: orange;
      border-color: orange;
  }
  
  .btn-primary:hover {
      background-color: rgb(236, 154, 2);
      border-color: white;
  }

  .flag-subject {
    font-size: 0.8rem;
  }

  .flag-writeup {
    font-size: 0.7rem;
  }

  .flag-flagger {
    font-size: 0.7rem;
  }
  .flag-status {
    font-size: 0.7rem;
  }
</style>