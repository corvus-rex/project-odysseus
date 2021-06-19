<template>
  <div>
    <Nav :appName = "appName"/>
      <b-card-group v-for="news in newsList" :key="news" 
      style="display: inline-block;" class="mt-3 ml-5" deck>
        <b-card style="max-width: 15rem;"
        no-body
        img-src="https://alppetro.co.id/dist/assets/images/default.jpg"
        img-alt="Thumbnail"
        img-top
        class="mb-3 mr-2 news-card"
        :title="news.title" button>
        <b-card-body>
          <b-card-title>{{news.title}}</b-card-title>
          <b-card-text class="small text-muted"> By: {{getAuthors(news.authors)}} </b-card-text>
          <b-card-text style="font-size: 0.8rem"> {{news.description}} </b-card-text>
          <router-link :to="{name: 'news', query: {id: news._id}}"
           class="btn btn-primary stretched-link">Read Article</router-link>
        </b-card-body>
        <b-card-body class="vote-bar">
            <div class="vote-bar-content">
              <button class="vote-btn" @click="upvote(news)">
                <b-icon icon="chevron-up" 
                :variant="upvoteVariant(news)"></b-icon>
              </button>
              <span class="vote"> {{votingList[news._id].rep}} </span>
              <button class="vote-btn" @click="downvote(news)" >
                <b-icon icon="chevron-down"
                :variant="downvoteVariant(news)"></b-icon>
              </button>
            </div>
        </b-card-body>
          <template #footer>
            <small class="text-muted">{{news.datePublished}}</small>
          </template>
        </b-card>
      </b-card-group>
  </div>
</template>

<script>

import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'
import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import newsroomManagerABI  from "../../../contracts/ABI/abi_newsroommanager.json"
import newsroomManagerReceipt from '../../../contracts/receipts/receipt_newsroommanager.json'

export default {
  name: 'Home',
  data: () => {
    return {
      appName: appName,
      user: {},
      newsList: [],
      votingList: {},
    }
  },
  components: {
    Nav
  },
  methods: {
    getNews() {
      axios.get(serverSide.getNews)
      .then((res) => {
        this.newsList = res.data.news
        this.getUpvoteDownvote()
        console.log(this.newsList)
      })
    },
    getUpvoteDownvote() {
      this.newsList.forEach(news => {
        this.votingList[news._id] = {
          "rep": news.rep,
          "upvoted": this.isUpvoted(news),
          "downvoted": this.isDownvoted(news),
          "isAuthors": true
        }
      });
      console.log(this.votingList)
    },
    isUpvoted(news) {
      try {
        return news.upvoted.includes(this.user._id)
      }
      catch {
        return false
      }
    },
    isDownvoted(news) {
      try {
        return news.downvoted.includes(this.user._id)
      }
      catch {
        return false
      }
    },
    async upvote(news) {
      await this.isAuthors(news)
      if (this.user != null) {
        axios.post(serverSide.findUserByID, {userID: this.user._id})
        .then((res) => {
          this.user.rep = res.data.user.rep
          if (this.votingList[news._id].upvoted == true) {
            alert('You have already voted!')
            return
          }
          else if (this.votingList[news._id].downvoted == true) {
            alert('You have already voted!')
            return
          }
          else if (this.votingList[news._id].isAuthors == true) {
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
            newsroomManagerContract.methods.upvoteNews(
              news.chainID
            ).send({
                from: address,
                gasPrice: 1,
                gas: 300000
            }).on('receipt', receipt => {
              console.log(receipt)
              axios.post(serverSide.castVote, {
                voterID: this.user._id,
                votingPower: votingPower,
                publicationID: news._id
              })
              .then(() => {
                this.votingList[news._id].rep += votingPower
                this.votingList[news._id].upvoted = true
                alert("Vote Casted")
                console.log("Voting List: ", this.votingList[news._id])
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
            newsroomManagerContract.methods.upvoteNews(
              news.chainID
            ).send({
                from: address,
                gasPrice: 1,
                gas: 300000
            }).on('receipt', receipt => {
              console.log(receipt)
              axios.post(serverSide.castVote, {
                voterID: this.user._id,
                votingPower: votingPower,
                publicationID: news._id
              })
              .then(() => {
                this.votingList[news._id].rep += votingPower
                this.votingList[news._id].upvoted = true
                alert("Vote Casted")
                console.log("Voting List: ", this.votingList[news._id])
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
    async downvote(news) {
      if (this.user != null) {
        await this.isAuthors(news)
        axios.post(serverSide.findUserByID, {userID: this.user._id})
        .then((res) => {
          this.user.rep = res.data.user.rep
          if (this.votingList[news._id].upvoted == true) {
            alert('You have already voted!')
            return
          }
          else if (this.votingList[news._id].downvoted == true) {
            alert('You have already voted!')
            return
          }
          else if (this.votingList[news._id].isAuthors == true) {
            alert('Authors of the same publisher is not allowed to vote this news!')
            return
          }
          else if (this.user.rep < 0) {
            alert('Your reputation score is not enough to vote!')
            return
          }
          else if (this.user.rep > 10) {
            let votingPower = -10
            let address = window.ethereum.selectedAddress
            let web3 = new Web3(
              new Web3.providers.HttpProvider(networkURL.networkURL))
            let newsroomManagerContract = new web3.eth.Contract(
              newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
                from: address
              }
            )
            newsroomManagerContract.methods.downvoteNews(
              news.chainID
            ).send({
                from: address,
                gasPrice: 1,
                gas: 300000
            }).on('receipt', receipt => {
              console.log(receipt)
              axios.post(serverSide.castVote, {
                voterID: this.user._id,
                votingPower: votingPower,
                publicationID: news._id
              })
              .then(() => {
                this.votingList[news._id].rep += votingPower
                this.votingList[news._id].downvoted = true
                alert("Vote Casted")
                console.log("Voting List: ", this.votingList[news._id])
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
            newsroomManagerContract.methods.downvoteNews(
              news.chainID
            ).send({
                from: address,
                gasPrice: 1,
                gas: 300000
            }).on('receipt', receipt => {
              console.log(receipt)
              axios.post(serverSide.castVote, {
                voterID: this.user._id,
                votingPower: votingPower,
                publicationID: news._id
              })
              .then(() => {
                this.votingList[news._id].rep += votingPower
                this.votingList[news._id].downvoted = true
                alert("Vote Casted")
                console.log("Voting List: ", this.votingList[news._id])
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
    async isAuthors(news) {
      if (this.user.hasPublisher == true) {
        await axios.post(serverSide.getPublisher, {
          userID: this.user._id, userRole: this.user.role
        })
        .then((res) => {
          console.log("Your News Publisher: ", res.data.publisher._id)
          console.log("Their News Publisher: ", news.publisher)
            if (news.publisher == res.data.publisher._id) {
              console.log("Same publishers")
              this.votingList[news._id].isAuthors = true
              console.log(this.votingList[news._id])
            }
            else {
              console.log("Different publishers")
              this.votingList[news._id].isAuthors = false
            }
          return
        })
      }
      else {
        this.votingList[news._id].isAuthors = false
      }
    },
    getAuthors(authors) {
      var authorString = ''
      var idx = 0
      for (var i = 0; i < authors.length; i++) {
          authorString += authors[i].firstName
          authorString += " "
          authorString += authors[i].lastName
          if(idx != authors.length -1) {
              authorString += ", "
          }
          idx += 1
      }
      return authorString
    },
    upvoteVariant(news) {
      if (this.votingList[news._id].upvoted) {
        return 'warning'
      }
      else {
        return ''
      }
    },
    downvoteVariant(news) {
      if (this.votingList[news._id].downvoted) {
        return 'primary'
      }
      else {
        return ''
      }
    }
  },
  created: async function(){
    try {
      var user = localStorage.getItem('user')
      this.user = JSON.parse(user)
    }
    catch {
      this.user = null
    }
    await this.getNews()
  }
}
</script>

<style scoped>
  h4.card-title {
    font-size: 1rem;
    font-weight: bold;
  }
  .btn-primary {
    background-color: orange;
    border-color: white;
  }
  .btn-primary:hover {
      background-color: rgb(236, 154, 2);
      border-color: white;
  }
  
  .btn-primary:focus,
  .btn-primary.focus {
      box-shadow: 0 0 0 .2rem rgba(247, 182, 4, 0.5)
  }
  .card-body {
    padding-bottom: 0rem;
  }
  .vote-bar {
    position: relative;
    z-index: 2;
    justify-content: center;
    margin-top: 1rem;
    padding: 0.2rem;
    padding-left: 5rem;
    background-color: rgba(0, 0, 0, 0.03);
    width: auto;
    border: 1px solid rgba(0, 0, 0, 0.125);
  }
  div.card-footer {
    border-top: none;
    position: relative;
    z-index: 2;
  }
  svg {
    pointer-events: all;
  }
  .vote-btn {
    border-style: none;
  }
</style>