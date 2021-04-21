<template>
  <!-- Material form login -->
  <div>
    <Nav :appName= "appName" />
    <b-card style="max-width: 40rem;" v-if="show" title="Signup" class="mt-5 ml-4">
      <b-form @submit.stop.prevent="onSubmit">
        <b-form-group label="Username" label-for="username-input">
          <b-form-input
            id="username-input"
            v-model="form.username"
            required
            placeholder="Enter your new username"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Email" label-for="email-input">
          <b-form-input
            id="email-input"
            name="email"
            v-model="form.email"
            v-validate="'email'"
            :state="validateState('email')"
            data-vv-as="email"
            placeholder="Enter your email"
            aria-describedby="error-email"
            class="mt-3"
          ></b-form-input>
          <b-form-invalid-feedback id="error-email">{{veeErrors.first('email')}}</b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="First Name" label-for="firstName-input">
          <b-form-input
            id="firstName-input"
            v-model="form.firstName"
            required
            placeholder="Enter your first name"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Last Name" label-for="lastName-input">
          <b-form-input
            id="lastName-input"
            v-model="form.lastName"
            required
            placeholder="Enter your last name"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="Public Key" label-for="publicKey-input">
          <b-form-input
            id="publicKey-input"
            v-model="form.publicKey"
            required
            style="max-width: 23rem; display: inline-block"
            placeholder="Get your wallet public address from metamask"
            class="mt-3"
            readonly
          ></b-form-input>
          <b-button class="app_action ml-2 mt-3" @click="detectWallet" 
          style="display: inline-block; vertical-align: top">
            Detect Metamask
          </b-button>
        </b-form-group>
        <b-form-group label="Password" label-for="password-input">
          <b-form-input
            id="password-input"
            ref="password"
            v-model="form.password"
            type="password"
            data-vv-name="password"
            v-validate name="password"
            :state="validateState('password')"
            data-vv-rules="required|min:8"
            placeholder="Enter password"
            class="mt-3"
          ></b-form-input>
          <b-form-invalid-feedback>{{veeErrors.first('password')}}</b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Confirm your password" label-for="confpassword-input">
          <b-form-input
            id="confpassword-input"
            v-model="form.confirmPassword"
            type="password"
            data-vv-as="confirm-password"
            v-validate name="confirm-password" 
            :state="validateState('confirm-password')"
            data-vv-rules="required|confirmed:password"
            placeholder="Confirm your password"
            class="mt-3"
          ></b-form-input>
          <b-form-invalid-feedback>{{veeErrors.first('confirm-password')}}</b-form-invalid-feedback>
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="handleSignup">Register</b-button>
        </div>
        <p class="comment text-right">Already have an account? Click 
            <router-link :to="{name: 'login'}">
            here
            </router-link>
            to login
        </p>
      </b-form>
    </b-card>
  </div>
  <!-- Material form login -->
</template>

<script>
  import Nav from '../components/Nav'
  import appName from '../appName'
  // import detectEthereumProvider from '@metamask/detect-provider';

  export default {
    name: 'Signup',
    data: () => {
      return {
        appName: appName,
        form: {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            publicKey: '',
            password: '',
            confirmPassword: ''
        },
        show: true
      }
    },
    components: {
      Nav
    },
    methods: {
      validateState(ref) {
        if (
          this.veeFields[ref] &&
          (this.veeFields[ref].dirty || this.veeFields[ref].validated)
        ) {
          return !this.veeErrors.has(ref);
        }
        return null;
      },
      handleSignup(e) {
        e.preventDefault();
        let username = this.form.username
        let email = this.form.email
        let password = this.form.password
        let firstName = this.form.firstName
        let lastName = this.form.lastName
        let publicKey = this.form.publicKey
        if (this.form.password.length > 0) {
          this.$store.dispatch('signup', {username, email, password, publicKey, firstName, lastName})
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
      },
      detectWallet() {
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        else {
          alert('Please install MetaMask!')
        }
        window.ethereum.request({method: 'eth_accounts'})
        .then(this.handleAccountsChanged)
        .catch((err) => console.log(err))
        window.ethereum.on('accountsChanged', this.handleAccountsChanged);
      },
      handleAccountsChanged() {
        var ethereum = window.ethereum
        if (!ethereum.selectedAddress) {
          // MetaMask is locked or the user has not connected any accounts
        } else if (ethereum.selectedAddress !== this.form.publicKey) {
          this.form.publicKey = ethereum.selectedAddress;
          console.log(this.form.publicKey)
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

  .app_action {
    background: #eba434
  }

  .comment a {
    color: #2554FF;
  }
</style>