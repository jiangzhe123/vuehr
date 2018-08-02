<template>
  <div>
    <el-container class="home-container">
      <el-header class="home-header">
        <span class="home_title">唐山学院计科系14物联网工程专业 -- 姜哲(4142001239) ---- 毕业设计</span>
        <span id="nowTime"></span>
        <div style="display: flex;align-items: center;margin-right: 7px">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link home_userinfo" style="display: flex;align-items: center">
              欢迎您 : {{user.realName}}
              <i><img class="headImg" src="../img/title.jpg"/></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout" divided>注销登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside width="180px" class="home-aside">
          <div style="display: flex;justify-content: flex-start;width: 180px;text-align: left;">
            <el-menu style="background: #ececec;width: 180px;" unique-opened router>
              <template v-for="(item,index) in this.routes" v-if="!item.hidden">
                <el-submenu :key="index" :index="index+''">
                  <template slot="title">
                    <i :class="item.iconCls" style="color: #20a0ff;width: 14px;"></i>
                    <span slot="title">{{item.name}}</span>
                  </template>
                  <el-menu-item width="180px"
                                style="padding-left: 30px;padding-right:0px;margin-left: 0px;width: 170px;text-align: left"
                                v-for="child in item.children"
                                :index="child.path"
                                :key="child.path">
                                <i :class="child.iconCls" style="color: #67c23a;width: 10px;padding-right:8px"></i>
                              <span slot="title">{{child.name}}</span>                 
                  </el-menu-item>
                </el-submenu>
              </template>
            </el-menu>
          </div>
        </el-aside>
        <el-container>
          <el-main>
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/home.html' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-text="this.$router.currentRoute.name"></el-breadcrumb-item>
            </el-breadcrumb>
            <!--keepAlive缓存 true的时候放进<keep-alive>
            帮助缓存
            false的时候不缓存 不放进<keep-alive>  直接就是
            <router-view>
            -->
            <keep-alive>
              <router-view v-if="this.$route.meta.keepAlive"></router-view>
            </keep-alive>
            <router-view v-if="!this.$route.meta.keepAlive"></router-view>
            <!--不同类型间比较，==之比较“转化成同一类型后的值”看“值”是否相等，===如果类型不同，其结果就是不等-->
            <div v-show="this.$route.path == '/home.html'" class="echartsOItem">
              <div id="detailedCount" class="echartsItem"></div>
              <div id="sickbedCount" class="echartsItem"></div>
              <div id="doctorCount" class="echartsItem"></div>
              <div id="departCount" class="echartsItem"></div>
            </div>
          </el-main>
          <!--在此加footer--> 
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<script>
  export default{
    //对于前端来说，钩子函数就是指再所有函数执行前，我先执行了的函数，即 钩住 我感兴趣的函数，只要它执行，我就先执行。
    //页面一进来就立马加载这个方法
    mounted: function () {
        //清单统计之昨日和今日总金额
        this.detailedCount();
        //病床之空不空 统计
        this.sickbedCount();
        //查询视图医师职位下的医生的数量
        this.doctorCount();
        //查询视图科室之医生患者病床统计柱状图
        this.departCount();
        //得到今日为多少号星期几
        this.getNowTime();
    },
    methods: {
      handleCommand(cmd){
        if (cmd == 'logout') {
          this.$confirm('注销登录, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.postRequest('/loginAndRegist/loginOutManager').then(resp=> {
              if (resp.data.success == 1 && resp.status == 200) {
                this.$message({
                  showClose: true,
                  center: true,
                  duration: 1000,
                  message: '注销成功',
                  type: 'success'
                });
              }else if(resp.data.success == 0){
                this.$message({
                  showClose: true,
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
              this.$store.commit('logout');
              this.$router.replace({path: '/'});
            });
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消'
            });
          });
        }
      },
      //查询视图清单统计之昨日和今日总金额
      detailedCount(){
        this.postRequest('/count/selectDetailedCountDto').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var detailedPrice = resp.data.result.detailedCountDto;
            let myChart = this.echarts.init(document.getElementById('detailedCount'));
            myChart.setOption({
              title : {
                  text: '昨日和今日清单总金额统计',
                  x:'center'
              },
              tooltip : {
                  trigger: 'item',
                  formatter: "{a} <br/>{b} : {c} ({d}%)"
              },
              legend: {
                  orient: 'vertical',
                  left: 'left',
                  data: ['昨日清单总金额','今日清单总金额']
              },
              series : [
                  {
                      name: '总金额数',
                      type: 'pie',
                      radius : '55%',
                      center: ['50%', '60%'],
                      data:[
                          {value:detailedPrice.ySum, name:'昨日清单总金额'},
                          {value:detailedPrice.tSum, name:'今日清单总金额'}
                      ],
                      itemStyle: {
                          emphasis: {
                              shadowBlur: 10,
                              shadowOffsetX: 0,
                              shadowColor: 'rgba(0, 0, 0, 0.5)'
                          }
                      }
                  }
              ]
            });
            }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
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
        });
      },
      //查询视图 病床之空不空 统计
      sickbedCount(){
        this.postRequest('/count/selectSickbedCountDto').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var sickbedNum = resp.data.result.sickbedCountDto;
            let myChart = this.echarts.init(document.getElementById('sickbedCount'));
            myChart.setOption({
              title : {
                  text: '病床非空和空统计',
                  x:'center'
              },
              tooltip : {
                  trigger: 'item',
                  formatter: "{a} <br/>{b} : {c} ({d}%)"
              },
              legend: {
                  orient: 'vertical',
                  left: 'left',
                  data: ['非空病床数量','空病床数量']
              },
              series : [
                  {
                      name: '病床数',
                      type: 'pie',
                      radius : '55%',
                      center: ['50%', '60%'],
                      data:[
                          {value:sickbedNum.notNullNum, name:'非空病床数量'},
                          {value:sickbedNum.nullNum, name:'空病床数量'}
                      ],
                      itemStyle: {
                          emphasis: {
                              shadowBlur: 10,
                              shadowOffsetX: 0,
                              shadowColor: 'rgba(0, 0, 0, 0.5)'
                          }
                      }
                  }
              ]
            });
          }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
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
        });
      },
      //查询视图医师职位下的医生的数量
      doctorCount(){
        this.postRequest('/count/selectDoctorCountDto').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var doctorCountList = resp.data.result.doctorCountDtoList;
            var doctorCountName = [];
            var doctorCountNum = [];
            doctorCountList.map((dcl) =>{
              doctorCountName.push(dcl.name);
              doctorCountNum.push(dcl.num);
            });
            let myChart = this.echarts.init(document.getElementById('doctorCount'));
            myChart.setOption({
              title : {
                  text: '医师资格下医师数量统计',
                  x:'center'
              },
              color: ['#3398DB'],
              tooltip : {
                  trigger: 'axis',
                  axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                      type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                  }
              },
              grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '3%',
                  containLabel: true
              },
              xAxis : [
                  {
                      type : 'category',
                      data : doctorCountName,
                      axisTick: {
                          alignWithLabel: true
                      }
                  }
              ],
              yAxis : [
                  {
                      type : 'value'
                  }
              ],
              series : [
                  {
                    name:'医师总数',
                    type:'bar',
                    barWidth: '60%',
                    label: {
                      normal: {
                          show: true,
                          position: 'inside'
                      }
                    },
                    data:doctorCountNum
                  }
              ]
            });
          }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
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
        });
      },
      //查询视图科室之医生患者病床统计柱状图
      departCount(){
        this.postRequest('/count/selectDepartCountDto').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var departCountList = resp.data.result.departCountDtoList;
            var departCountParent = [];
            var departCountChild = [];
            var departCountCon = ['product', '医生的数量', '患者的数量', '病床的数量'];
            departCountParent.push(departCountCon);
            departCountList.map((dcl) =>{
              departCountChild = [dcl.name,dcl.dNum,dcl.pNum,dcl.sNum];
              departCountParent.push(departCountChild);
            });
            let myChart = this.echarts.init(document.getElementById('departCount'));
            myChart.setOption({
              title : {
                  text: '科室之医生/患者/病床数量统计',
                  x:'center'
              },
              legend: {
                top:30
              },
              tooltip: {},
              dataset: {
                  source: departCountParent     
              },
              grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '3%',
                  containLabel: true
              },
              xAxis: {type: 'category'},
              yAxis: {},
              // Declare several bar series, each will be mapped
              // to a column of dataset.source by default.
              series: [
                  {
                    type: 'bar',            
                    label: {
                      normal: {
                          show: true,
                          position: 'inside'
                      }
                    }
                  },
                  {
                    type: 'bar',            
                    label: {
                      normal: {
                          show: true,
                          position: 'inside'
                      }
                    }
                  },
                  {
                    type: 'bar',            
                    label: {
                      normal: {
                          show: true,
                          position: 'inside'
                      }
                    }
                  }
              ]
            });
          }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
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
        });
      },
      getNowTime(){
          var dt=new Date();
          var arr_week=new Array("星期日","星期一","星期二","星期三","星期四","星期五","星期六");
          var strWeek=arr_week[dt.getDay()];
          var strYear=dt.getFullYear()+"年";
          var strMonth=(dt.getMonth()+1)+"月";
          var strDay=dt.getDate()+"日";
          nowTime.innerHTML=strYear+strMonth+strDay+" "+strWeek;
      }
    },
    data(){
      return {

      }
    },
    //computed相当于属性的一个实时计算，如果实时计算里关联了对象，那么当对象的某个值改变的时候，同事会出发实时计算。
    computed: {
      user(){
        return this.$store.state.user;
      },
      routes(){
        return this.$store.state.routes
      }
    }
  }
</script>
<style>
  .home-container {
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
  }

  .home-header {
    background-color: #20a0ff;
    color: #333;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: content-box;
    padding: 0px;
  }

  .home-aside {
    background-color: #ECECEC;
  }

  .home-main {
    background-color: #fff;
    color: #000;
    text-align: center;
    margin: 0px;
    padding: 0px;;
  }

  .home_title {
    color: #fff;
    font-size: 22px;
    display: inline;
    margin-left: 8px;
  }

  .home_userinfo {
    color: #fff;
    font-size: 22px;
    cursor: pointer;
  }

  .el-submenu .el-menu-item {
    width: 180px;
    min-width: 175px;
  }

  .echartsOItem{
    zoom: 1;
    padding-top: 45px;
    height: 100%;
    margin-top: -35px;
  }
  .echartsOItem:after{
        clear: both;
        display: block;
        visibility: hidden;
        overflow: hidden;
        height: 0;
        content: ".";
        font-size: 0;
    }

  .echartsItem{
    float: left;
    width: 50%;
    height: 50%;
    box-sizing: border-box;
    padding: 5px 10px;
  }

  #nowTime{
    color: #fff;
    font-size: 22px;
  }

  .headImg{
    width: 40px;
    height: 40px;
    margin-right: 5px;
    margin-left: 5px;
    border-radius: 40px;
  }
</style>
