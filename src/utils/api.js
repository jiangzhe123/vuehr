import axios from 'axios'
import {Message} from 'element-ui'

//添加请求拦截器
axios.interceptors.request.use(config=> {
  //在发送请求之前做某事，比如说 设置loading动画显示
  return config;
}, err => {
  //请求错误时做些事
  Message.error({message: '请求超时!服务器未开启!'});
  return Promise.resolve(err);
})
//添加响应拦截器
axios.interceptors.response.use(response => {
  //对响应数据做些事，比如说把loading动画关掉
  return response;
}, err => {
  //请求错误时做些事
  return Promise.resolve(err);
})

let base = 'http://118.89.246.66:8080';
export const postRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: params,
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    // 带cookie请求，后台session会话会响应一个唯一标示的id，浏览器根据此id生成前台cookie，前台和后台会话一致了。
    withCredentials: true, //加了这段就可以跨域了 
    timeout: 5000
  });
}


