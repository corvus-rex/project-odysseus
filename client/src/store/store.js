import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import serverSide from '../serverSide'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user : {}
  },
  mutations: {
    auth_request(state){
      state.status = 'loading'
    },
    register_request(state){
      state.status = 'loading'
    },
    auth_success(state, token, user){
      state.status = 'success'
      state.token = token
      state.user = user
    },
    register_success(state){
      state.status = 'success'
    },
    auth_error(state){
      state.status = 'error'
    },
    register_error(state){
      state.status = 'error'
    },
    logout(state){
      state.status = ''
      state.token = ''
    },
  },
  actions: {
    login({commit}, user){
        return new Promise((resolve, reject) => {
          commit('auth_request')
          axios({url: serverSide.login, data: user, method: 'POST' })
          .then(resp => {
            const token = resp.data.token
            const user = resp.data.user
            const userJSON = JSON.stringify(user)
            localStorage.setItem('user', userJSON)
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = token
            commit('auth_success', token, user)
            resolve(resp)
          })
          .catch(err => {
            commit('auth_error')
            localStorage.removeItem('token')
            reject(err)
          })
        })
    },
    signup({commit}, user){
      return new Promise((resolve, reject) => {
        commit('auth_request')
        axios({url: serverSide.signup, data: user, method: 'POST'})
        .then(resp => {
          const token = resp.data.token
          const user = resp.data.user
          const userJSON = JSON.stringify(user)
          localStorage.setItem('user', userJSON)
          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = token
          commit('auth_success', token, user)
          resolve(resp)
        }).catch(err => {
          commit('auth_error')
          localStorage.removeItem('token')
          reject(err)
        })
      })
    },
    registerPublisher({commit}, data){
      return new Promise((resolve, reject) => {
        commit('register_request')
        var formData = new FormData()
        formData.append('name', data.name)
        formData.append('logo', data.logo, data.logo.name)
        formData.append('chiefOfficer', data.chiefOfficer)
        axios.post(serverSide.registerPublisher, formData)
        .then(resp => {
          commit('register_success')
          resolve(resp)
        }).catch(err => {
          commit('register_error')
          reject(err)
        })
      })
    },
    logout({commit}){
        return new Promise((resolve) => {
          commit('logout')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          delete axios.defaults.headers.common['Authorization']
          resolve()
        })
      }
  },
  getters : {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
  }
})