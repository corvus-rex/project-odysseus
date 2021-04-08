<template>
  <!-- Material form login -->
  <div>
    <Nav :appName= "appName" />
    <b-card style="max-width: 40rem;" v-if="show" title="Log In" class="mt-5">
      <b-form>
        <b-form-input
          id="username-input"
          v-model="form.email"
          required
          placeholder="Enter your email"
        ></b-form-input>
        <b-form-input
          id="password-input"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter password"
          class="mt-3"
        ></b-form-input>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="handleLogin">Login</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
  <!-- Material form login -->
</template>

<script>
  import Nav from './Nav'
  import appName from '../appName'
  import serverSide from '../serverSide'

  export default {
    name: 'Login',
    data: () => {
      return {
        appName: appName,
        form: {
          email: '',
          password: ''
        },
        show: true
      }
    },
    components: {
      Nav
    },
    methods: {
      handleLogin(e) {
        e.preventDefault();
        var loginRoute = serverSide + 'user/login';
        console.log(loginRoute)
        if (this.form.password.length > 0) {
          console.log(this.form.email)
          this.$http.post(loginRoute, {
            email: this.form.email,
            password: this.form.password
          })
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('jwt', response.data.token)
            console.log(localStorage.getItem('jwt'))
            if (localStorage.getItem('jwt') != null) {
              this.$emit('loggedIn')
              if (this.$route.params.nextUrl != null) {
                this.$router.push(this.$route.params.nextUrl)
              }
              else {
                this.$router.push('profile')
              }
            }
          })
          .catch(function (error) {
            console.error(error.response);
          });
        }
      }
    }
  }
</script>