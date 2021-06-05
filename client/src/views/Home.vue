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
              <b-icon icon="chevron-up"
              @click="upvote(news)" variant="warning"></b-icon>
              <span class="vote"> {{news.rep}} </span>
              <b-icon icon="chevron-down"
              @click="downvote(news)" :variant="{primary: votingList[news._id].downvoted}"></b-icon>
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

export default {
  name: 'Home',
  data: () => {
    return {
      appName: appName,
      user: {},
      newsList: [],
      votingList: {}
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
          "downvoted": this.isDownvoted(news)
        }
      });
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
    getAuthors(authors) {
      var authorString = ''
      var idx = 0
      console.log(authors)
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
</style>