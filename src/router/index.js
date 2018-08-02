import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'

Vue.use(Router)

export default new Router({
  //此模式浏览器路径会去除/#/  
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
      hidden: true
    }, {
      path: '/home.html',
      name: '主页',
      component: Home,
      hidden: true,
      meta: {
        keepAlive: false, // 不需要缓存
        requireAuth: true//表示进入这个路由是需要登录的
      }
    }
  ]
})
