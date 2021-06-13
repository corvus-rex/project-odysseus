<template>
    <div>
    <Nav :appName= "appName" />
    <b-card 
    style="max-width: 70rem;" 
    title="Create a New Revision" 
    class="mt-5 ml-4">
      <b-form @submit.stop.prevent="onSubmit">
        <b-form-group label="Article Title" label-for="title-input">
          <b-form-input
            id="title-input"
            v-model="newsTitle"
            required
            placeholder="Enter the news title"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="This Revision is Flagged By" label-for="flagger-username">
          <b-form-input
            id="flagger-username"
            v-model="flagger.username"
            readonly
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label= "Article Description" label-for="description-input">
          <b-form-textarea
            id="description-input"
            size="sm"
            v-model="newsDescription"
            required
            placeholder="Enter the news description"
            class="mt-3"
          ></b-form-textarea>
        </b-form-group>
        <b-form-group label="Article Topic" label-for="topic-input">
          <b-form-input
            id="topic-input"
            v-model="newsTopic"
            required
            placeholder="Enter the news topic"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Article Tags" label-for="tags-input">
          <b-form-tags
              id="tags-input"
              v-model="newsTags"
              separator=" ,;"
              placeholder="Enter tag(s) to add..."
              class="mt-3"
          ></b-form-tags>
        </b-form-group>
        <b-form-group label="News Locations" label-for="locations-input">
          <b-form-tags
              id="locations-input"
              v-model="newsLocations"
              separator=" ,;"
              placeholder="Enter location(s) to add..."
              class="mt-3"
          ></b-form-tags>
        </b-form-group>
        <b-form-group label="Write the article's draft" label-for="news-editor">
          <quill-editor
            id="news-editor"
            ref="myQuillEditor"
            v-model="news"
            :options="editorOption"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @ready="onEditorReady($event)"
          />
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="newRevision">Create Revision</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

import serverSide from '../serverSide'
import axios from 'axios'
import sha256 from 'js-sha256'

import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import newsroomManagerABI  from "../../../contracts/ABI/abi_newsroommanager.json"
import newsroomManagerReceipt from '../../../contracts/receipts/receipt_newsroommanager.json'

export default {
    name: 'newDraft',
    data: () => {
        return {
            appName: appName,
            publicationID: "",
            publication: {},
            draftPublisher: "",
            prevVersions: [],
            author: {},
            publisher: {},
            chiefOfficer: '',
            newsTitle: "",
            newsDescription: "",
            newsTopic: "",
            newsTags: [],
            newsLocations: [],
            news: null,
            flag: null,
            hasFlagger: false,
            flagger: {},
            editorOption: {
              'theme': 'snow',
              'scrollingContainer': 'div.ql-container.ql-snow'
            }
        }
    },
    components: {
        Nav, quillEditor
    },
    computed: {
      editor() {
        return this.$refs.myQuillEditor.quill
      }
    },
    methods: {
      onEditorBlur(quill) {
        console.log('editor blur!', quill)
      },
      onEditorFocus(quill) {
        console.log('editor focus!', quill)
      },
      onEditorReady(quill) {
        console.log('editor ready!', quill)
      },
      onEditorChange({ quill, html, text }) {
        console.log('editor change!', quill, html, text)
        // this.news = html
      },
      getFlag() {
          axios.post(serverSide.getFlag, {flagID: this.$route.query.flagID})
          .then((res) => {
              this.flag = res.data.flag
              console.log("Has Flagger", this.flag)
              this.getFlagger()
          })
      },
      getFlagger() {
          axios.post(serverSide.findUserByID, {userID: this.flag.flaggerID})
          .then((res) => {
              this.flagger = res.data.user
              this.getPublisher()
          })
      },
      getPublisher() {
          axios.post(serverSide.getPublisher, {userID: this.author._id, userRole: this.author.role})
          .then((res) => {
              this.publisher = res.data.publisher
              this.chiefOfficer = res.data.chiefOfficer
              console.log(this.publisher)
              this.getPublication()
          })
      },
      getPublication() {
        this.publicationID = this.$route.query.id
        axios.post(serverSide.getPublication, {publicationID: this.publicationID})
        .then((res) => {
          if(this.publisher._id != res.data.publication[0].publisher) {
            this.$router.push({name: "newsroom"})
          }
          else {
            this.publication = res.data.publication[0]
            this.newsTitle = res.data.publication[0].title
            this.newsDescription = res.data.publication[0].description
            this.newsTopic = res.data.publication[0].topic
            this.newsTags = res.data.publication[0].tags
            this.newsLocations = res.data.publication[0].locations
            this.news = res.data.publication[0].article
            this.prevVersions = res.data.publication[0].prevVersions
          }
        })
      },
      newRevision() {
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        else {
          alert('Please install MetaMask!')
        }
        var authors = this.publication.authors
        var authorsID = []
        for (var i = 0; i < authors.length; i++) {
            authorsID.push(authors[i]._id)
        }
        if (!authorsID.includes(this.author._id)) {
          authors.push(this.author)
          authorsID.push(this.author._id)
        }
        var authorsKey = []
        for (var c = 0; c < authors.length; c++) {
            authorsKey.push(authors[c].publicKey)
        }
        var address = window.ethereum.selectedAddress
        var toBeHashed = this.publication
        delete toBeHashed.datePublished
        delete toBeHashed.revised
        delete toBeHashed.status
        delete toBeHashed.rep
        delete toBeHashed.upvoted
        delete toBeHashed.downvoted
        delete toBeHashed.flags
        var stringifiedPublication = JSON.stringify(toBeHashed)
        var hashedArticle = sha256.create()
        hashedArticle.update(stringifiedPublication)
        const web3 = new Web3(
          new Web3.providers.HttpProvider(networkURL.networkURL))
        var newsroomManagerContract = new web3.eth.Contract(
          newsroomManagerABI, newsroomManagerReceipt.contractAddress, {
            from: address
          }
        )
        if (this.flag == null) {
          newsroomManagerContract.methods.createRevision(
              this.publication.chainID,
              this.newsTitle,
              authorsKey,
              this.chiefOfficer.publicKey,
              hashedArticle.hex()
          ).send({
              from: address,
              gasPrice: 1,
              gas: 300000
          }).on('receipt', receipt => {
            console.log(receipt)
            var chainID = receipt.events.NewsRevised.returnValues.newsID
            axios.post(serverSide.newRevision,{
              publicationID: this.publicationID,
              authorID: this.author._id,
              publisherID: this.publisher._id,
              prevVersions: this.prevVersions,
              title: this.newsTitle,
              description: this.newsDescription,
              topic: this.newsTopic,
              tags: this.newsTags,
              locations: this.newsLocations,
              article: this.news,
              flagID: this.flag._id,
              flaggerID: this.flagger._id,
              chainID: chainID
            })
            .then((res) => {
              console.log(res.data.publication)
              this.$router.push({name: "newsroom"})
            })
          }).on('error', err => {
            console.log(err)
          })
        }
        else {
          newsroomManagerContract.methods.acceptFlag(
              this.flag.chainID,
              this.newsTitle,
              authorsKey,
              hashedArticle.hex()
          ).send({
              from: address,
              gasPrice: 1,
              gas: 500000,
              value: Web3.utils.toWei('1', 'ether')
          }).on('receipt', receipt => {
            console.log(receipt)
            var chainID = receipt.events.FlagAccepted.returnValues.newsID
            axios.post(serverSide.newRevision,{
              publicationID: this.publicationID,
              authorID: this.author._id,
              publisherID: this.publisher._id,
              prevVersions: this.prevVersions,
              title: this.newsTitle,
              description: this.newsDescription,
              topic: this.newsTopic,
              tags: this.newsTags,
              locations: this.newsLocations,
              article: this.news,
              flagID: this.flag._id,
              flaggerID: this.flagger._id,
              chainID: chainID
            })
            .then((res) => {
              console.log(res.data.publication)
              this.$router.push({name: "newsroom"})
            })
          }).on('error', err => {
            console.log(err)
          })
        }
      },
      viewPublication() {
        console.log(this.news)
      }
    },
    created: async function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.author = userParsed
        if (this.$route.query.flagID != null) {
          await this.getFlag()
        }
        else {
          await this.getPublisher()
        }
    }
}
</script>

<style>
  div.ql-container.ql-snow {
    overflow: auto;
    height: 30rem;
    overflow: visible;
  }
</style>