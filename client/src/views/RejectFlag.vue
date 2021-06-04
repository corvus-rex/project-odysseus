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
    title="Submit a Flag Rejection" 
    class="mt-2 ml-4">
      <b-form @submit.stop.prevent="onSubmit">
        <b-form-group label="Counter-Flag Writeup" label-for="cflag-writeup">
          <b-form-textarea
            id="cflag-writeup"
            v-model="counterFlagWriteup"
            required
            rows="8"
            placeholder="Explain why you reject this flag submission..."
            class="mt-3"
          ></b-form-textarea>
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="submitCounterFlag">
            Submit
          </b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'
// import {registerPublisher} from '../contracts/callContract'

export default {
    name: 'RejectFlag',
    data: () => {
        return {
            appName: appName,
            user: {},
            publisher: {},
            publication: {},
            flag: {},
            counterFlagWriteup: ""
        }
    },
    components: {
        Nav
    },
    methods: {
        isAuthors() {
          if (this.user != null) {
              axios.post(serverSide.getPublisher, {
                userID: this.user._id, userRole: this.user.role
              })
              .then((res) => {
                  this.publisher = res.data.publisher
                  if (this.publication.publisher == this.publisher._id) {
                    this.getFlag()
                  }
                  else {
                    this.$router.push({name: "news", query:{id: this.publication._id}})
                  }
              })
          }
        },
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
            this.isAuthors()
          })
        },
        getFlag() {
          axios.post(serverSide.getFlag, {
            publicationID: this.publication._id,
            flagID: this.$route.params.flagID
          })
          .then((res) => {
            this.flag = res.data.flag
            console.log(this.flag)
          })
        },
        submitCounterFlag() {
            // if (typeof window.ethereum !== 'undefined') {
            //   window.ethereum.request({ method: 'eth_requestAccounts' });
            // }
            // else {
            //   alert('Please install MetaMask!')
            // }
            // var address = window.ethereum.selectedAddress
            // registerPublisher(this.pubName, address)
            axios.post(serverSide.submitCounterFlag, {
              userID: this.user._id,
              publicationID: this.publication._id,
              flagID: this.flag._id,
              counterFlagWriteup: this.counterFlagWriteup
            })
            .then((res) => {
              console.log(res.data.counterflag)
              this.$router.push({name: "news", query:{id: this.publication._id}})
            })
            .catch(function (error) {
                console.error(error.response);
            });
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