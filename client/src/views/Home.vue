<template>
  <div>
    <Nav :appName = "appName"/>
      <b-card-group v-for="news in newsList" :key="news" 
      style="display: inline-block;" class="mt-3 ml-5" deck>
        <b-card style="max-width: 15rem;"
        img-src="https://alppetro.co.id/dist/assets/images/default.jpg"
        img-alt="Thumbnail"
        img-top
        class="mb-3 mr-2 news-card"
        :title="news.title" button>
          <b-card-text class="small text-muted"> By: {{getAuthors(news.authors)}} </b-card-text>
          <b-card-text style="font-size: 0.8rem"> {{news.description}} </b-card-text>
          <template #footer>
            <small class="text-muted">{{news.datePublished}}</small>
          </template>
          <router-link :to="{name: 'news', query: {id: news._id}}" class="btn btn-primary stretched-link">Read Article</router-link>
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
      newsList: []
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
        console.log(this.newsList)
      })
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
</style>