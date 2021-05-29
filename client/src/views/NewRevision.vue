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
// import {registerPublisher} from '../contracts/callContract'

export default {
    name: 'newDraft',
    data: () => {
        return {
            appName: appName,
            publicationID: "",
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
          article: this.news
        })
        .then((res) => {
          console.log(res.data.publication)
          this.$router.push({name: "newsroom"})
        })
      },
      viewPublication() {
        console.log(this.news)
      }
    },
    created: async function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.author = userParsed
        await this.getPublisher()
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