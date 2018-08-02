// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'
import {postRequest} from './utils/api'
import {initMenu} from './utils/utils'
import './utils/filter_utils'
import 'font-awesome/css/font-awesome.min.css'
import echarts from 'echarts'
//设置 Vue.config.productionTip = false 来关闭生产模式下给出的提示
Vue.config.productionTip = false
Vue.use(ElementUI)

Vue.prototype.postRequest = postRequest;
Vue.prototype.store = store;
Vue.prototype.echarts = echarts;

//全局守卫  to: Route: 即将要进入的目标 路由对象  
//from: Route: 当前导航正要离开的路由 
//next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
//https://router.vuejs.org/zh-cn/advanced/navigation-guards.html 网址
router.beforeEach((to, from, next)=> {
    //当访问登录页面的时候直接过去
    if (to.name == 'Login') {
      next();
      return;
    }
    var name = store.state.user.realName;
    if (name == '未登录') {
      if (to.meta.requireAuth || to.name == null) {
        //next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，且允许设置诸如 replace: true、name: 'home' 之类的选项以及任何用在 router-link 的 to prop 或 router.push 中的选项。
        //跳到登录页面
        next({path: '/', query: {redirect: to.path}})
      } else {
        next();
      }
    } else {
      //根据当前登录人判断权限 查询路由列表
      initMenu(router, store);
      next();
    }
  })

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
