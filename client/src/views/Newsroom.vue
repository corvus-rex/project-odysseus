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
                    <b-list-group class="mt-3">
                        <b-list-group-item v-for="published in publishedList" :key="published">
                            <b-container>
                                <b-row>
                                    <b-col class="publication-title" cols="8">{{ published.title }}</b-col>
                                    <b-col class="draft-btn" cols="4">
                                        <b-button variant="primary"
                                        :to="{name: 'new-revision', query: {id: published._id}}">
                                        New Revision </b-button>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Written by</u>: {{ getAuthors(published.authors) }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Topic</u>: {{ published.topic }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Date Published</u>: {{ published.datePublished }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Rep Score</u>: {{ published.rep }}
                                    </b-col>
                                    <b-col class="publication-meta" cols="8">
                                        <u>Previous Versions</u>: {{ getPrevVersions(published.prevVersions) }}
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-list-group-item>
                    </b-list-group>
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
                                        <b-button variant="secondary"
                                        :to="{name: 'edit-draft', query: {id: draft._id}}">
                                        Edit</b-button>
                                    </b-col>
                                    <b-col class="draft-btn" cols="2">
                                        <b-button variant="danger" @click="confirmModal(draft)">Publish</b-button>
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
            <b-modal title="Confirm Publish Article" id="confirm-publish" @ok="publishDraft">
                <p class="confirm-text"> Are you sure you wish to publish this article? </p>
            </b-modal>
        </div>
    </div>
</template>

<script>
import sha256 from 'js-sha256'
import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'
import {publishDraft} from '../contracts/callContract'

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
            draftList: [],
            selectedPublication: null
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
                this.getPublishedList()
            })
        },
        getPublishedList() {
            console.log(this.publisher._id)
            axios.post(serverSide.getPublishedList, {
                publisherID: this.publisher._id
            })
            .then((res) => {
                this.publishedList = res.data.published
                console.log(this.publishedList)
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
        },
        getPrevVersions(prevVersions) {
            var prevVersionsStr = ''
            var idx = 0
            if (prevVersions.length != 0) {
                for (var i=0; i < prevVersions.length; i++) {
                    prevVersionsStr += prevVersions[i]
                    if(idx != prevVersions.length - 1) {
                        prevVersionsStr += ", "
                    }
                    idx += 1
                }
                return prevVersionsStr
            }
            else {
                return "None"
            }
        },
        confirmModal(draft) {
            this.selectedPublication = draft
            this.$bvModal.show('confirm-publish')
        },
        publishDraft() {
            console.log(this.selectedPublication)
            if (typeof window.ethereum !== 'undefined') {
              window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            else {
              alert('Please install MetaMask!')
            }
            var authors = this.selectedPublication.authors
            var authorsKey = []
            for (var i = 0; i < authors.length; i++) {
                authorsKey.push(authors[i].publicKey)
            }
            var address = window.ethereum.selectedAddress
            var hashedDraft = sha256.update(this.selectedPublication.article.toString())
            publishDraft(authorsKey, this.selectedPublication._id, hashedDraft, address)
            axios.post(serverSide.publishDraft, {
                draft: this.selectedPublication,
                approver: this.user._id
            })
            .then((res) => {
                console.log(res.data.publication)
                this.$router.go()
            })
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
