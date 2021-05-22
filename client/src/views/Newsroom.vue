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
                <b-card style="width: 30rem;" v-if="published" :title="getPublishedTitle()" class="mt-3 ml-1">
                    
                </b-card>
                <b-card style="width: 30rem;" v-if="drafts" :title="getDraftsTitle()" class="mt-3 ml-1">
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
                console.log(this.publisher)
            })
        },
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
