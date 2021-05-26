<template>
    <div>
        <Nav :appName = "appName"/>
        <div>
            <b-list-group id="dash-nav" class="mt-3 ml-5">
                <b-list-group-item :active="published" 
                @click="switchPublishedDashboard" button> Published News </b-list-group-item>
                <b-list-group-item :active="drafts" 
                @click="switchDraftsDashboard" button> Draft List </b-list-group-item>
            </b-list-group>
            <div id="dashboard">
                <b-card style="width: 50rem;" v-if="published" :title="getPublishedTitle()" class="mt-3 ml-1">
                    
                </b-card>
                <b-card style="width: 50rem;" v-if="drafts" :title="getDraftsTitle()" class="mt-3 ml-1">
                    <router-link :to="{name: 'new-draft'}">
                        <b-button id="register-pub" 
                        variant="primary"> Create a New Draft </b-button>
                    </router-link>
                    <b-list-group class="mt-3">
                        <b-list-group-item v-for="draft in draftList" :key="draft">
                            <b-container>
                                <b-row>
                                    <b-col class="publication-title" cols="8">{{ draft.title }}</b-col>
                                    <b-col class="draft-btn" cols="2">
                                        <b-button variant="secondary">Edit</b-button>
                                    </b-col>
                                    <b-col class="draft-btn" cols="2">
                                        <b-button variant="danger">Publish</b-button>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Written by</u>: {{ getAuthors(draft.authors) }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Topic</u>: {{ draft.topic }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Last Revised</u>: {{ draft.datePublished }}
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </div>
        </div>
    </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'

export default {
    name: 'Newsroom',
    data: () => {
        return {
            appName: appName,
            user: null,
            publisher: {},
            chiefOfficer: null,
            published: true,
            drafts: false,
            publishedList: [],
            draftList: []
        }
    },
    props: {
    },
    components: {
        Nav
    },
    methods: {
        switchPublishedDashboard() {
            this.published = true
            this.drafts = false
        },
        switchDraftsDashboard() {
            this.published = false
            this.drafts = true
        },
        getPublishedTitle() {
            return this.publisher.name + " Published News Articles"
        },
        getDraftsTitle() {
            return this.publisher.name + " Drafts"
        },
        getPublisher() {
            axios.post(serverSide.getPublisher, {userID: this.user._id, userRole: this.user.role})
            .then((res) => {
                this.publisher = res.data.publisher
                this.chiefOfficer = res.data.chiefOfficer
                this.getDraftList()
            })
        },
        getDraftList() {
            console.log(this.publisher._id)
            axios.post(serverSide.getDrafts, {
                publisherID: this.publisher._id
            })
            .then((res) => {
                this.draftList = res.data.drafts
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
        }
    },
    computed: {
    },
    created: async function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.user = userParsed
        await this.getPublisher()
    }
}
</script>

<style scoped>
    #register-pub {
        margin: auto
    }
    #dashboard {
        display: inline-block;
        vertical-align: top;
    }
    #dash-nav {
        display: inline-block;
        max-width: 20rem;
        vertical-align: top;
    }
    .draft-btn.col-2 {
        padding: 0
    }
    .publication-title.col-8 {
        font-weight: bold
    }
    .publication-meta.col-8 {
        font-size: 0.8rem
    }
    .list-group-item.active {
        background-color: orange;
        border-color: orange;
    }
    .btn-primary {
        background-color: orange;
        border-color: orange;
    }
    .panel-group {
        font-size: 1.2rem;
    }
    hr.rounded {
        border-top: 3px solid #bbb;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        border-radius: 5px;
    }
</style>
