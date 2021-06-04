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
// import {registerPublisher} from '../contracts/callContract'

export default {
    name: 'newDraft',
    data: () => {
        return {
            appName: appName,
            newsID: "",
            news: {}
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
        })
      },
      getStatusColor(flag) {
        var now = Date.now().valueOf()
        var timeDiff = (now - Date.parse(flag.dateSubmitted)) / 1000
        if (flag.status == "Accepted") {
          return "color: green;"
        }
        else if (flag.status == "Rejected") {
          return "color: yellow"
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
          return "Accepted"
        }
        else if (flag.status == "Rejected") {
          return "Rejected"
        }
        else if (timeDiff < flag.expirySeconds) {
          return "Pending"
        }
        else {
          return "Ignored"
        }
      }
    },
    created: async function() {
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