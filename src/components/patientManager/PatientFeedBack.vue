<template>
  <section>
    <!--工具条-->
    <el-col :span="15" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1 || roleNumber==2" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="patientFeedbackList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="patient.name" label="患者名称" width="80">
      </el-table-column>
      <el-table-column align='center' prop="patient.phone" label="患者手机号" width="130">
      </el-table-column>
      <el-table-column align='center' prop="patient.sex" label="性别" width="60" :formatter="formatSex">
      </el-table-column>
      <el-table-column align='center' prop="patient.patientState" :formatter="formatPatientState" label="患者目前状态" width="150">
      </el-table-column>
      <el-table-column align='center' prop="feedbackContent" label="反馈内容" width="130">
      </el-table-column>
      <el-table-column align='center' prop="feedbackDateStr" label="反馈日期" width="150">
      </el-table-column>
      <el-table-column align='center' label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="danger" v-if="roleNumber==1 || roleNumber==2" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="danger" v-if="roleNumber==0" size="small">无权限操作</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条 分页-->
    <el-col :span="24" class="toolbar">
      <el-pagination background layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pageNum"
      :page-sizes="[5,10]" :page-size="pageSize" :total="total" style="float:right;">
      </el-pagination>
    </el-col>

  </section>
</template>

<script>
  export default {
    data() {
      return {
        patientFeedbackList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

      }
    },
    methods: {
      //性别显示转换
      formatSex: function (row, column) {
        return row.patient.sex == 1 ? '男' : row.patient.sex == 0 ? '女' : '未知';
      },
      formatPatientState: function (row, column) {
        return row.patient.patientState == -1 ? '无病床' : row.patient.patientState == 0 ? '有病床' : '已出院';
      },
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getPatientFeedbackList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getPatientFeedbackList();
      },
      //获取科室列表
      getPatientFeedbackList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          orderByClause: "feedbackDate desc"
        };
        this.listLoading = true;
        this.postRequest('/patientFeedback/selectAllPatientFeedback',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.patientFeedbackList = data.patientFeedbackList;
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
            this.listLoading = false;
        });
      },
      //删除
      handleDel: function (index, row) {
        this.$confirm('确认删除该患者反馈?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/patientFeedback/deletePatientFeedbackByIds',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {  
              this.$message({
                message: '删除成功',
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
            this.listLoading = false;
            this.getPatientFeedbackList();
          });
        }).catch(() => {

        });
      },
    
      //批量选择
      selsChange: function (sels) {
        this.sels = sels;
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中的['+this.sels.length+']个患者反馈吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/patientFeedback/deletePatientFeedbackByIds',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              this.$message({
                message: '批量删除成功',
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
            this.listLoading = false;
            this.getPatientFeedbackList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getPatientFeedbackList();
    }
  }

</script>

<style scoped>

</style>