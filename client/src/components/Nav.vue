<template>

<div>
  <b-navbar type="dark" id="custom_navbar">
    <b-navbar-brand href="/">{{ appName }}</b-navbar-brand>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item href="/">News Today</b-nav-item>
        <b-nav-item href="#">Browse by Categories</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
          <b-nav-item href='/publishers/newsroom' class="special-auth" v-if="hasPublisher">
            Newsroom
          </b-nav-item>
          <b-nav-item href='/users/profile'>
              <b-icon-person-circle class="hovericon"></b-icon-person-circle>
          </b-nav-item>
          <b-nav-item href='/users/login' v-show="!this.$store.getters.isLoggedIn">Login</b-nav-item>
          <b-nav-item-dropdown right v-show="this.$store.getters.isLoggedIn">
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em> {{ getUsername }}</em>
              <b-badge v-show="notifNum > 0" 
                class="ml-1" variant="info"> {{ notifNum }}</b-badge>
            </template>
            <b-dropdown-item href="/users/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="handleLogout">Sign Out</b-dropdown-item>
            <b-dropdown-item v-b-modal.notifs-modal>
              Notifications
              <b-badge variant="info"> {{ notifNum }}</b-badge>
            </b-dropdown-item>
          </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
  <b-modal id="notifs-modal" title="Notifications" hide-footer scrollable>
    <b-list-group>
      <b-list-group-item v-for="notif in notifs" :key="notif">
        <b-row>
          <b-col cols="1"><b-icon icon="envelope-fill"></b-icon></b-col>
          <b-col cols="9">
            <h4 class="notif-title">{{notif.data.title}}</h4>
            <p class="notif-message"> {{notif.data.message}} </p>
          </b-col>
          <b-col cols="2" v-if="notif.class == 'invite/author'">
            <b-button class="notif-button" variant="primary" @click="acceptInv(notif)">Accept</b-button>
            <b-button class="notif-button" variant="secondary" @click="IgnoreInv(notif)">Ignore</b-button>
          </b-col>
        </b-row>
      </b-list-group-item>
    </b-list-group>
  </b-modal>
</div>
</template>

<style scoped>
#custom_navbar {
    background: #eba434;
}

.special-auth {
  border-style: solid;
  border-color: white;
}

.notif-title {
  font-size: 0.8rem;
}

.notif-message {
  font-size: 0.7rem;
}

.notif-button {
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}
</style>

<script>
import axios from 'axios'
import serverSide from '../serverSide.js'
export default {
  name: 'Nav',
  data: () => {
    return {
      user: null,
      notifs: null,
      notifNum: 0,
      hasPublisher: false
    }
  },
  computed: {
    getUsername: () => {
      if (localStorage.getItem('user') != null) { 
        var username = localStorage.getItem('user')
        var usernameParsed = JSON.parse(username)
        return usernameParsed.username
      }
      else {
        return "Anon"
      }
    },
  },
  created() {
    var user = localStorage.getItem('user')
    var userParsed = JSON.parse(user)
    this.user = userParsed
    this.getNotifNum()
    this.hasPublisher = this.user.hasPublisher
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/')
      })
    },
    getNotifNum() {
      try {
        var promises = []
        promises.push(axios.post(serverSide.getNotifs, {userID: this.user._id})
        .then(res => {
          console.log(res.data.notifs.length.toString())
          this.notifs = res.data.notifs
          this.notifNum = res.data.notifs.length
        }))
        Promise.all(promises)
      }
      catch (err){
        console.log(err)
        return null
      }
    },
    acceptInv(notif) {
      let promises = []
      var user = localStorage.getItem('user')
      var userParsed = JSON.parse(user)
      promises.push(
        axios.post(serverSide.changeNotifStatus, {
          notifID: notif._id,
          status: "read"
        })
      )
      promises.push(
        axios.post(serverSide.acceptAuthorship, {
          userID: userParsed._id,
          publisherID: notif.data.publisher,
          publicKey: userParsed.publicKey
        })
        .then(res => {
          const user = res.data.user
          const userJSON = JSON.stringify(user)
          console.log(userJSON)
          this.user = userJSON
        })
      )
      Promise.all(promises).then(() => {
        this.$router.go()
        localStorage.setItem("user", this.user)
      })
    }
  },
  props: {
    appName: String
  }
}
</script>