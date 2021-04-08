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
        let email = this.form.email
        let password = this.form.password
        if (this.form.password.length > 0) {
          this.$store.dispatch('login', {email, password})
          .then(() => {
            if (this.$store.getters.isLoggedIn) {
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