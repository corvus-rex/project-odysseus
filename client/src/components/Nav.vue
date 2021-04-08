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
          <b-nav-item href='users/profile'>
              <b-icon-person-circle class="hovericon"></b-icon-person-circle>
          </b-nav-item>
          <b-nav-item href='/users/login' v-show="!this.$store.getters.isLoggedIn">Login</b-nav-item>
          <b-nav-item-dropdown right v-show="this.$store.getters.isLoggedIn">
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em> {{ getUsername }}</em>
            </template>
            <b-dropdown-item href="/users/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="handleLogout">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
</template>

<style scoped>
#custom_navbar {
    background: #eba434;
}
</style>

<script>
export default {
  name: 'Nav',
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
    }
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/')
      })
    }
  },
  props: {
    appName: String
  }
}
</script>