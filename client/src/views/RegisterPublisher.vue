<template>
    <div>
    <Nav :appName= "appName" />
    <b-card style="max-width: 40rem;" title="Register New Publisher" class="mt-5 ml-4">
      <b-form @submit.stop.prevent="onSubmit">
        <b-form-group label="Publisher Name" label-for="name-input">
          <b-form-input
            id="name-input"
            v-model="pubName"
            required
            placeholder="Enter the new publisher name"
            class="mt-3"
          ></b-form-input>
        </b-form-group>
        <b-form-group label= "Publisher Logo" label-for="logo-input">
            <input
             id="logo-input"
             type="file" 
             accept="image/*" 
             @change="uploadImage">
        </b-form-group>
        <div class="mt-2">
          <b-button variant="primary" type="submit" @click="handleRegister">Register</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import Nav from '../components/Nav'
import appName from '../appName'
export default {
    name: 'RegisterPublisher',
    data: () => {
        return {
            appName: appName,
            userID: '',
            pubName: '',
            publicKey: '',
            logo_data: null
        }
    },
    components: {
        Nav
    },
    methods: {
        uploadImage(event) {
            this.logo_data = event.target.files[0]
        },
        handleRegister() {
            this.$store.dispatch('registerPublisher', 
            {name: this.pubName, chiefOfficer: this.userID, logo: this.logo_data})
            .then(() => {
                if (this.$route.params.nextUrl != null) {
                    this.$router.push(this.$route.params.nextUrl)
                }
                else {
                    this.$router.push('profile')
                }
            })
            .catch(function (error) {
                console.error(error.response);
            });
        }
    },
    created: function() {
        var user = localStorage.getItem('user')
        var userParsed = JSON.parse(user)
        this.userID = userParsed._id
        this.publicKey = userParsed.publicKey
    }
}
</script>