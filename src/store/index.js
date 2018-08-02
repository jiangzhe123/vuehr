import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      id : window.localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).id,
      realName: window.localStorage.getItem('user' || '[]') == null ? '未登录' : JSON.parse(window.localStorage.getItem('user' || '[]')).realName,
      userName: window.localStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.localStorage.getItem('user' || '[]')).userName,
    },
    //路由初始化
    routes: [],
    //从路由信息中得到的  用于判断当前管理员 可管理的按钮
    roleNumber:'',
  },
  //通俗的理解mutations,里面装着一些改变数据方法的集合也就是说state里面的数据是动态变化的，那么怎么改变呢，切记在Vuex中store数据改变的唯一方法就是mutation！
  mutations: {
    initMenu(state, menus){
      state.routes = menus;
    },
    login(state, user){
      state.user = user;
      window.localStorage.setItem('user', JSON.stringify(user));
    },
    initRoleNumber(state, roleNumber){
      state.roleNumber = roleNumber;
      window.localStorage.setItem('roleNumber', roleNumber);
    },
    logout(state){
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('roleNumber');
      state.routes = [];
    }
  },
  //Action 提交(操作)的是 mutations里面的方法们，而不是直接变更状态. Action 是异步的，mutations是同步的。
  actions: {
  
  }
});
