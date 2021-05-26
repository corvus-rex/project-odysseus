import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/store'
import Nav from '../components/Nav.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Profile from '../views/Profile.vue'
import appName from '../appName'
import RegisterPublisher from '../views/RegisterPublisher.vue'
import Newsroom from '../views/Newsroom.vue'
import NewDraft from '../views/NewDraft.vue'
import EditDraft from '../views/EditDraft.vue'

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
    components: {
      default: Signup,
      nav: Nav
    },
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
  },
  {
    path: '/publishers/new',
    name: 'new-publisher',
    components: {
      default: RegisterPublisher,
      nav: Nav
    },
    props: {appName: appName},
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/publishers/newsroom',
    name: 'newsroom',
    components: {
      default: Newsroom,
      nav: Nav
    },
    props: {appName: appName},
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/drafts/new',
    name: 'new-draft',
    components: {
      default: NewDraft,
      nav: Nav
    },
    props: {appName: appName},
    meta: {
      requiresAuth: true
    }
  },
  {
    path: 'drafts/edit',
    name: 'edit-draft',
    components: {
      default: EditDraft,
      nav: Nav
    },
    props: route => ({
      draftID: route.query.id,
      appName: appName
    }),
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
