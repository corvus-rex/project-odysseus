<template>
  <!-- Material form login -->
  <div>
    <Nav :appName= "appName" />
    <b-card style="max-width: 40rem;" v-if="show" title="Log In" class="mt-5 ml-4">
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
      <p class="comment text-right">Don't have an account? Click 
        <router-link :to="{name: 'signup'}">
          here</router-link>
         to join!
      </p>
    </b-card>
  </div>
  <!-- Material form login -->
</template>

<script>
  import Nav from '../components/Nav'
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

<style scoped>
  .comment,
  .comment a {
    text-align: right;
    font-size: 13px;
    padding-top: 10px;
    color: #7a7a7a;
    margin: 0;
  }

  .comment a {
    color: #2554FF;
  }
</style>