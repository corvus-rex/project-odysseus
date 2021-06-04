import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/store'
import Nav from '../components/Nav.vue'
import Home from '../views/Home.vue'
import News from '../views/News.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Profile from '../views/Profile.vue'
import appName from '../appName'
import RegisterPublisher from '../views/RegisterPublisher.vue'
import Newsroom from '../views/Newsroom.vue'
import NewDraft from '../views/NewDraft.vue'
import EditDraft from '../views/EditDraft.vue'
import NewRevision from '../views/NewRevision.vue'
import FlagSubmission from '../views/FlagSubmission.vue'
import RejectFlag from '../views/RejectFlag.vue'
import ViewRejection from '../views/ViewRejection.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      default: Home,
      nav: Nav
    },
    props: {appName: appName}
  },
  {
    path: '/news/',
    name: 'news',
    components: {
      default: News,
      nav: Nav
    },
    props: route => ({
      draftID: route.query.id,
      appName: appName
    }),
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
    path: '/drafts/edit',
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
  },
  {
    path: '/news/newRevision',
    name: 'new-revision',
    components: {
      default: NewRevision,
      nav: Nav
    },
    props: route => ({
      publicationID: route.query.id,
      flaggerID: route.query.flaggerID,
      appName: appName
    }),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/flags/new',
    name: 'flag-submission',
    components: {
      default: FlagSubmission,
      nav: Nav
    },
    props: route => ({
      publicationID: route.query.id,
      flagIndex: route.query.flagIndex,
      appName: appName
    }),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/flags/reject/:publicationID/:flagID',
    name: 'reject-flag',
    components: {
      default: RejectFlag,
      nav: Nav
    },
    props: {
      appName: appName
    },
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/flags/rejection/:publicationID/:flagID',
    name: 'view-rejection',
    components: {
      default: ViewRejection,
      nav: Nav
    },
    props: {
      appName: appName
    },
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
