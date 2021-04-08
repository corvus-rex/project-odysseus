<template>

<div>
  <b-navbar type="dark" id="custom_navbar">
    <b-navbar-brand href="#">{{ appName }}</b-navbar-brand>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item href="#">News Today</b-nav-item>
        <b-nav-item href="#">Browse by Categories</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
          <b-nav-item href=#>
              <b-icon-person-circle class="hovericon"></b-icon-person-circle>
          </b-nav-item>
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
  props: {
    appName: String
  }
}
</script>