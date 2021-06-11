<template>
    <div>
        <Nav :appName = "appName"/>
        <div>
            <b-list-group id="dash-nav" class="mt-3 ml-5">
                <b-list-group-item :active="profile" 
                @click="switchProfileDashboard" button> User Profile </b-list-group-item>
                <b-list-group-item :active="publishing" 
                @click="switchPubDashboard" button> Publishing </b-list-group-item>
            </b-list-group>
            <div id="dashboard">
                <b-card style="width: 30rem;" v-if="profile" :title="getUsername()" class="mt-3 ml-1">
                    <b-form-group label="Username" label-for="username-input">
                        <b-form-input
                            id="username-input"
                            v-model="username"
                            readonly
                            class="mt-3"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Email" label-for="email-input">
                        <b-form-input
                            id="email-input"
                            v-model="email"
                            readonly
                            class="mt-3"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group label="First Name" label-for="fn-input">
                        <b-form-input
                            id="fn-input"
                            v-model="firstName"
                            readonly
                            class="mt-3"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Last Name" label-for="ln-input">
                        <b-form-input
                            id="ln-input"
                            v-model="lastName"
                            readonly
                            class="mt-3"
                        ></b-form-input>
                    </b-form-group>
                    <b-form-group label="Public Key" label-for="key-input">
                        <b-form-input
                            id="key-input"
                            v-model="publicKey"
                            readonly
                            class="mt-3"
                        ></b-form-input>
                    </b-form-group>
                </b-card>
                <b-card style="width: 30rem;" v-if="publishing  && !hasPublisher" title="Register as New Publisher" class="mt-3 ml-1">
                    <router-link :to="{name: 'new-publisher'}">
                        <b-button id="register-pub" 
                        variant="primary"> Register a New Publication </b-button>
                    </router-link>
                </b-card>
                <b-card style="width: 30rem;" v-if="publishing && hasPublisher" :title="publishingTitle()" class="mt-3 ml-1">
                    <hr class="rounded">
                    <h4 class="panel-group">Rep Score: {{this.publisher.rep}}</h4>
                    <h4 class="panel-group">Chief Officer: @{{this.chiefOfficer.username}}</h4>
                    <h4 class="panel-group">Authors: <a href="#" @click="$bvModal.show('authors-modal')">{{this.publisher.authors.length}}</a></h4>
                    <h4 class="panel-group">Pending Authors: {{this.publisher.pendingAuthors.length}}</h4>
                    <b-button v-b-modal.inviteauth-modal id="invite-auth" 
                    variant="primary" v-if="isChief"> Invite New Authors </b-button>
                    <b-list-group class="mt-3">
                        <b-list-group-item v-for="email in authEmails" :key="email">
                            <b-container>
                                <b-row style="font-size: 1rem;">New Author Email</b-row>
                                <b-row align-h="end">
                                    <b-col style="display: inline-block; vertical-align: top"> {{ email }} </b-col>
                                    <b-col style="display: inline-block; vertical-align: top">
                                        <b-button variant="primary" 
                                        @click="deleteEmail(authEmails.indexOf(email))">
                                        Remove </b-button>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-list-group-item>
                    </b-list-group>
                    <b-button v-if="authEmails.length != 0" 
                    variant="primary" @click="inviteAuthors()">Invite</b-button>
                </b-card>
                <b-card style="width: 30rem;" v-if="publishing && hasPublisher"
                 title="These authors has accepted invitation" class="mt-3 ml-1">
                    <b-list-group class="mt-3">
                        <b-list-group-item v-for="author in acceptedAuthors" :key="author">
                            <b-container>
                                <b-row style="font-size: 1rem;"> {{ author.email }} </b-row>
                                <b-row align-h="end">
                                    <b-col style="display: inline-block; vertical-align: top"> @{{ author.username }} </b-col>
                                    <b-col>
                                        <b-button class="confirm-button" 
                                        variant="primary" 
                                        v-if="isChief"
                                        @click="registerAuthor(author)">Register</b-button>
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </div>
        </div>
        <b-modal id="inviteauth-modal" 
        :title="authModalTitle()" 
        @show="resetModal" @hidden="resetModal" @ok="pushEmails">
            <b-form-group label="Enter author's emails" label-for="auth-email-input">
                <b-form-tags
                    id="auth-email-input"
                    v-model="authEmailsInput"
                    separator=" ,;"
                    placeholder="Enter email(s) to add..."
                    class="mt-3"
                ></b-form-tags>
            </b-form-group>
        </b-modal>
        <b-modal id="authors-modal"
        title="Authors">
            <b-list-group>
                <b-list-group-item v-for="author in authors" :key="author">
                    <b-row>
                        <b-col cols="9">
                            <h4 class="author-title"> {{author.firstName + " " + author.lastName}} </h4>
                            <p class="author-data"> Email: {{author.email}} </p>
                            <p class="author-data"> Username: {{author.username}} </p>
                            <p class="author-data"> Rep Score: {{author.rep}} </p>
                        </b-col>
                        <b-col>
                            <b-button class="revoke-button" 
                            variant="danger" 
                            v-if="isChief"
                            @click="revokeAuthor(author.id, author.publicKey, publisher._id)">Revoke Authorship</b-button>
                        </b-col>
                    </b-row>
                </b-list-group-item>
            </b-list-group>
        </b-modal>
    </div>
</template>

<script>
import Web3 from 'web3'
import networkURL from '../../../contracts/networkURL.js'
import userManagerABI  from "../../../contracts/ABI/abi_usermanager.json"
import userManagerReceipt from '../../../contracts/receipts/receipt_usermanager.json'

import Nav from '../components/Nav'
import appName from '../appName'
import serverSide from '../serverSide'
import axios from 'axios'

export default {
    name: 'Profile',
    data: () => {
        return {
            show: true,
            appName: appName,
            id: String,
            username: String,
            email: String,
            firstName: String,
            lastName: String,
            publicKey: String,
            role: String,
            profile: true,
            publishing: false,
            hasPublisher: false,
            publisher: {},
            authors: [],
            chiefOfficer: null,
            isChief: false,
            authEmailsInput: [],
            authEmails: [],
            acceptedAuthors: []
        }
    },
    props: {
    },
    components: {
        Nav
    },
    methods: {
        getUsername() {
            return "Welcome back, " + this.username
        },
        publishingTitle() {
            return this.publisher.name + " Dashboard"
        },
        authModalTitle() {
            if(this.publisher == null) {return null}
            else {return "Invite new author to " + this.publisher.name}
        },
        switchProfileDashboard() {
            this.profile = true
            this.publishing = false
        },
        switchPubDashboard() {
            this.profile = false
            this.publishing = true
        },
        getPublisher() {
            axios.post(serverSide.getPublisher, {userID: this.id, userRole: this.role})
            .then((res) => {
                this.publisher = res.data.publisher
                this.chiefOfficer = res.data.chiefOfficer
                console.log(this.publisher)
                if (this.id === this.chiefOfficer._id) {
                    this.isChief = true
                }
                else {
                    this.isChief = false
                }
                this.getAuthorsData()
            })
        },
        getAuthorsData() {
            let promises = []
            console.log(this.publisher.acceptedAuthors)
            this.publisher.acceptedAuthors.forEach(userID => {
                promises.push(
                    axios.post(serverSide.findUserByID, {userID: userID})
                    .then(res => {
                        console.log(res.data)
                        let id = res.data.user._id
                        let firstName = res.data.user.firstName
                        let lastName = res.data.user.lastName
                        let username = res.data.user.username
                        let email = res.data.user.email
                        let rep = res.data.user.rep
                        let publicKey = res.data.user.publicKey
                        this.acceptedAuthors.push({
                            id: id,
                            firstName: firstName, 
                            lastName: lastName,
                            username: username,
                            email: email,
                            rep: rep,
                            publicKey: publicKey
                        })
                    })
                )
            })
            this.publisher.authors.forEach(userID => {
                promises.push(
                    axios.post(serverSide.findUserByID, {userID: userID})
                    .then(res => {
                        let id = res.data.user._id
                        let firstName = res.data.user.firstName
                        let lastName = res.data.user.lastName
                        let username = res.data.user.username
                        let email = res.data.user.email
                        let rep = res.data.user.rep
                        let publicKey = res.data.user.publicKey
                        this.authors.push({
                            id: id,
                            firstName: firstName, 
                            lastName: lastName,
                            username: username,
                            email: email,
                            rep: rep,
                            publicKey: publicKey
                        })
                    })
                )
            })
            Promise.all(promises)
        },
        resetModal() {
            this.authEmailsInput = []
        },
        pushEmails() {
            this.authEmailsInput.forEach(element => {
                this.authEmails.push(element)
            });
            console.log(this.authEmails)
        },
        deleteEmail(index) {
            this.authEmails.splice(index, 1)
        },
        inviteAuthors() {
            let promises = []
            this.authEmails.forEach(element => {
                promises.push(
                    axios.post(serverSide.inviteAuthors, 
                    {userID: this.id, recipientEmail: element})
                    .then(res => console.log(res.data))
                )
            })
            Promise.all(promises).then(() => this.$router.go())
        },
        revokeAuthor(authorID, publicKey, publisherID) {
            console.log(authorID)
            axios.post(serverSide.revokeAuthorship,
            {
                authorID: authorID,
                authorKey: publicKey,
                publisherID: publisherID
            })
            .then( res => {
                console.log(res.data.publisher)
                this.$router.go()
            })
        },
        registerAuthor(author) {
            if (typeof window.ethereum !== 'undefined') {
              window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            else {
              alert('Please install MetaMask!')
              return
            }
            var address = window.ethereum.selectedAddress
            const web3 = new Web3(
              new Web3.providers.HttpProvider(networkURL.networkURL))
            var userManagerContract = new web3.eth.Contract(
              userManagerABI, userManagerReceipt.contractAddress, {
                from: address
              }
            )
            userManagerContract.methods.grantAuthorship(author.publicKey).send({
                from: address,
                gasPrice: 1,
                gas: 200000
            }).on('receipt', (receipt) => {
                console.log(receipt)
                axios.post(serverSide.registerAuthor,
                {
                    authorID: author.id,
                    publisherID: this.publisher._id
                }).then( res => {
                    console.log(res.data.publisher)
                    this.$router.go()
                })
            }).on(('error'), (err) => {
                console.log(err)
            })
        }
    },
    computed: {
    },
    created: async function() {
        var username = localStorage.getItem('user')
        var userParsed = JSON.parse(username)
        this.id = userParsed._id
        this.username = userParsed.username
        this.email = userParsed.email
        this.firstName = userParsed.firstName
        this.lastName = userParsed.lastName
        this.publicKey = userParsed.publicKey
        this.role = userParsed.role
        this.hasPublisher = userParsed.hasPublisher
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
