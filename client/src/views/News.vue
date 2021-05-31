<template>
    <div>
    <Nav :appName= "appName" />
    <b-card 
    style="max-width: 70rem;" 
    :title="news.title" 
    class="mt-5 ml-4">
      <small class="text-muted">Written by: {{getAuthors}} at {{news.datePublished}}</small> <br>
      <small class="text-muted">Topic: {{news.topic}}</small> <br>
      <div class="mt-5" v-html="news.article"/>
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
      }
    },
    created: async function() {
        await this.getPublication()
    }
}
</script>

<style>
</style>