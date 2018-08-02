<template>
  <section>
    <!--工具条-->
    <el-col :span="20" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入操作人姓名查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getHandleRecordList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" v-if="roleNumber==1" @click="updateDataByState">回滚数据</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" v-if="roleNumber==1" @click="before15Remove">清洗数据</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="handleRecordList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="handleName" label="操作人姓名" width="100">
      </el-table-column>
      <el-table-column align='center' prop="handleRole" label="操作人角色" width="120">
      </el-table-column>
      <el-table-column align='center' prop="handleContent" label="操作内容" width="250">
      </el-table-column>
      <el-table-column align='center' prop="handleDateStr" label="操作时间" width="170">
      </el-table-column>
      <el-table-column align='center' label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="danger" v-if="roleNumber==1" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
        filters: {
          text: ''
        },
        handleRecordList: [],
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
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getHandleRecordList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getHandleRecordList();
      },
      //获取操作记录列表
      getHandleRecordList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          handleName: this.filters.text,
          orderByClause: "handleDate desc"
        };
        this.listLoading = true;
        this.postRequest('/handleRecord/selectAllHandleRecord',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.handleRecordList = data.handleRecordList;
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
        this.$confirm('确认删除该操作记录?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/handleRecord/updateHandleRecord',para).then(resp=> {
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
            this.getHandleRecordList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']条操作记录吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/handleRecord/updateHandleRecord',para).then(resp=> {
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
            this.getHandleRecordList();
          });
        }).catch(() => {

        });
      },
      //清洗数据
      before15Remove: function () {
        this.$confirm('确认清洗数据(该操作会删除半个月之前的所有记录,请谨慎操作)？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          this.postRequest('/handleRecord/deleteDataBefore15').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              this.$message({
                message: '清洗数据成功',
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
            this.getHandleRecordList();
          });
        }).catch(() => {

        });
      },
      //回滚数据
      updateDataByState: function () {
        this.$confirm('确认回滚数据(该操作会恢复已删除的所有记录)？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          this.postRequest('/handleRecord/updateDataByState').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              this.$message({
                message: '回滚数据成功',
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
            this.getHandleRecordList();
          });
        }).catch(() => {

        });
      },
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getHandleRecordList();
    }
  }

</script>

<style scoped>

</style>