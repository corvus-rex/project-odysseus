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
    name: 'ViewRejection',
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
            console.log(this.flag)
          })
        },
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