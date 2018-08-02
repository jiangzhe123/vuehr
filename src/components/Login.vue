<template>
  <div class="login_bg">
    <el-form :rules="rules" :model="loginForm" class="login-container" ref="loginForm" label-position="left"
             label-width="0px" v-loading="loading">
      <h3 class="login_title">系统登录</h3>
      <el-form-item prop="userName">
        <el-input type="text" v-model="loginForm.userName" auto-complete="off" placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="loginForm.password" @keyup.enter.native="submitClick" auto-complete="off" placeholder="密码"></el-input>
      </el-form-item>
      <el-checkbox class="login_remember" v-model="checked" label-position="left">记住密码</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button type="primary" @click.native.prevent="submitClick" style="width: 100%">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  export default{
    data(){
      return {
        rules: {
          userName: [{
            required: true,
            message: '请输入用户名', 
            trigger: 'blur'
          }, {
            min: 5,
            max: 15,
            message: '长度在 5 到 15 个字符'
          }, {
            pattern:/^[a-zA-Z][a-zA-Z0-9_]{4,14}$/, 
            message: '以字母开头，长度在5-15之间， 允许字母数字下划线'
          }],
          password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }, {
            min: 5,
            max: 15,
            message: '密码长度在 5 到 15 个字符'
          }, {
            pattern: /^[a-zA-Z]\w{4,14}$/,
            message: '以字母开头，长度在5~15之间，只能包含字母、数字和下划线'
          }],
        },
        checked: true,
        loginForm: {
          userName: '',
          password: ''
        },
        loading: false
      }
    },
    methods: {
      submitClick: function () {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            let para = {
              userName: this.loginForm.userName,
              password: this.loginForm.password
            };
            this.loading = true;
            this.postRequest('/loginAndRegist/loginManager',para).then(resp=> {
              if (resp.data.success == 1 && resp.status == 200) {
                this.$message({
                  showClose: true,
                  center: true,
                  duration: 1000,
                  message: '登录成功',
                  type: 'success'
                });
                var data = resp.data.result.data;
                this.$store.commit('login', data);
                var path = this.$route.query.redirect;
                this.$router.replace({path: path == '/' || path == undefined ? '/home.html' : path});
              }else if(resp.data.success == 0){
                this.$message({
                  showClose: true,
                  center: true,
                  duration: 2000,
                  type: 'error', 
                  message:resp.data.errorMsg
                });
              }else{
                this.$message({
                  showClose: true,
                  center: true,
                  duration: 2000,
                  type: 'error', 
                  message:"未知错误!"
                });
              }
              this.loading = false;
            });
          }
        });  
      }
    }
  }
</script>
<style>
  .login-container {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 0 auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
  }
  
  .login_title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }

  .login_remember {
    margin: 0px 0px 35px 0px;
    text-align: left;
  }

  .login_bg {
    width: 100%;
    height: 100%;
    padding:130px 0;
    background-image: url('../img/login.jpg');
    background-size: cover;
    background-position: center;
  }
</style>
