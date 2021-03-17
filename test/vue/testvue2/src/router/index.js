import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Home = () => import(/* webpackPrefetch: true */ /* webpackChunkName: 'Home' */ '../views/Home')
const TestVModel = () => import(/* webpackPrefetch: true */ /* webpackChunkName: "TestVModel" */ '../views/TestVModel')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
    },
  },
  {
    path: '/testvmodel',
    name: 'TestVModel',
    component: TestVModel,
    meta: {
      title: '',
    },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title || ''
  }
  next()
})

export default router
