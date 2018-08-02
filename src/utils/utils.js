import {postRequest} from './api'
import {Message} from 'element-ui'

export const initMenu = (router, store)=> {
  if (store.state.routes.length > 0) {
    return;
  }
  postRequest("/route/selectRouteByManager").then(resp=> {
    if (resp.data.success == 1 && resp.status == 200) {
      var roleNumber = resp.data.result.data[1].roleNumber;
      var fmtRoutes = formatRoutes(resp.data.result.data);
      router.addRoutes(fmtRoutes);
      store.commit('initMenu', fmtRoutes);
      store.commit('initRoleNumber', roleNumber);    
    }else if(resp.data.success == 0){
      this.$message({
        showClose: true,
        center: true,
        duration: 2000,
        type: 'error', 
        message:resp.data.errorMsg
      });
      router.replace({path: '/'});
    }else{
      this.$message({
        showClose: true,
        center: true,
        duration: 2000,
        type: 'error', 
        message:"未知错误!"
      });
      router.replace({path: '/'});
    }
  })
}
export const formatRoutes = (routes)=> {
  let fmRoutes = [];
  routes.map((pr) =>{
    var childenRoutes = pr.childRoutes;
    var childrenArray = [];
    let objectPr = {
        path: pr.path,
        component(resolve){       
            require(['../components' + pr.component], resolve)
        },
        name: pr.name,
        iconCls: pr.iconClass,
        meta: {    
          keepAlive: false, // 不需要缓存    
          requireAuth: true//表示进入这个路由是需要登录的
        },  
        children: childrenArray
    };
    childenRoutes.map((cr) =>{
        let objectCr = {
            path: cr.path,
            component(resolve){
              require(['../components' + cr.component], resolve)
            }, 
            name: cr.name,
            iconCls: cr.iconClass,
            meta: {
              keepAlive: false, // 不需要缓存
              requireAuth: true// 添加该字段，表示进入这个路由是需要登录的
            },
        }
        childrenArray.push(objectCr); 
    }) 
    fmRoutes.push(objectPr);
  })
  return fmRoutes;
}
