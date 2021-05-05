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
                    <h4 class="panel-group">Authors: {{this.publisher.authors.length}}</h4>
                    <h4 class="panel-group">Pending Authors: {{this.publisher.pendingAuthors.length}}</h4>
                    <b-button v-b-modal.inviteauth-modal id="invite-auth" 
                    variant="primary"> Invite New Authors </b-button>
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
    </div>
</template>

<script>
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
            publisher: null,
            chiefOfficer: null,
            authEmailsInput: [],
            authEmails: []
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
            })
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
        }
    },
    computed: {
    },
    created: function() {
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
        this.getPublisher()
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
