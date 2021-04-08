import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/store'
import Nav from '../components/Nav.vue'
import Login from '../components/Login.vue'
import Profile from '../components/Profile.vue'
import appName from '../appName'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Nav,
    props: {appName: appName}
  },
  {
    path: '/users/login',
    name: 'login',
    components: {
      default: Login,
      nav: Nav
    },
    props: {appName: appName},
    meta: {
      guest: true
    }
  },
  {
    path: '/users/signup',
    name: 'signup',
    component: Nav,
    props: {appName: appName},
    meta: {
      guest: true
    }
  },
  {
    path: '/users/profile',
    name: 'profile',
    components: {
      default: Profile,
      nav: Nav
    },
    props: {appName: appName},
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isLoggedIn) {
      next({
        path: '/users/login',
        params: {nextUrl: to.fullPath}
      })
    }
    else {
      next()
    }
  }
  else if (to.matched.some(record => record.meta.guest)) {
    if(!store.getters.isLoggedIn) {
      next()
    }
    else {
      next({name: 'profile'})
    }
  }
  else {
    next()
  }
})

export default router;
