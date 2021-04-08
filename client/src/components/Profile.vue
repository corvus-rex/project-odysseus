<template>
    <div>
        <Nav :appName = "appName"/>
        <h1> Welcome back, {{ getUsername }} </h1>
    </div>
</template>

<script>
  import Nav from './Nav'
  import appName from '../appName'
//   import serverSide from '../serverSide'

export default {
    name: 'Profile',
    data: () => {
        return {
            appName: appName
        }
    },
    components: {
        Nav
    },
    computed: {
        getUsername() {
            var username = localStorage.getItem('user')
            var usernameParsed = JSON.parse(username)
            return usernameParsed.username
        }
    }
}
</script>
