<template>
  <section>
    <!--工具条-->
    <el-col :span="20" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入权限名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getPowerList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="roleNumber==1" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="powerList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="powerName" label="权限名称" width="150">
      </el-table-column>
      <el-table-column align='center' prop="powerCode" label="权限标识符" width="150">
      </el-table-column>
      <el-table-column align='center' label="操作" width="230">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="success" size="small" v-if="roleNumber==1" @click="allotRoute(scope.$index, scope.row)">分配</el-button>
          <el-button type="danger" v-if="roleNumber==1" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="danger" v-if="roleNumber==0" size="small">无权限操作</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条 分页-->
    <el-col :span="24" class="toolbar">
      <el-pagination background layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pageNum"
      :page-sizes="[5,10]" :page-size="pageSize" :total="total" style="float:none;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="权限名称" prop="powerName">
          <el-input v-model="editForm.powerName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="powerCode">
          <el-input v-model="editForm.powerCode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--分配路由-->
    <el-dialog title="分配路由" :visible.sync="allotRouteVisible" :close-on-click-modal="false">
      <el-radio-group v-model="radioRoute">
        <template v-for="item in routeList">
          <el-radio :label="item.id" :key="item.id" border>
          {{item.name}}</el-radio>
        </template>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="allotRouteVisible = false">取消</el-button>
        <el-button type="primary" @click.native="allotSubmit" :loading="allotLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="权限名称" prop="powerName">
          <el-input v-model="addForm.powerName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="powerCode">
          <el-input v-model="addForm.powerCode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import util from '../../utils/dateUtil'
  export default {
    data() {
      return {
        filters: {
          text: ''
        },
        powerList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          powerName: [
            { required: true, message: '请输入权限名称', trigger: 'blur' }
          ]
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          powerName: '',
          powerCode: '',
        },

        allotRouteVisible: false,//分配路由界面是否显示
        allotLoading: false,//提交的加载显示框
        routeList: [], //查询全部路由信息
        radioRoute: '', //默认选中的routeID
        currentPowerId: '',//定义当前被操作权限的ID  

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          powerName: [
            { required: true, message: '请输入权限名称', trigger: 'blur' }
          ]
        },
        //新增初始化界面数据
        addForm: {
          powerName: '',
          powerCode: '',
        }
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getPowerList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getPowerList();
      },
      //获取用户列表
      getPowerList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          powerName: this.filters.text,
        };
        this.listLoading = true;
        this.postRequest('/power/selectAllPower',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.powerList = data.powerList;
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
        this.$confirm('确认删除该权限?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/power/deletePowerByIds',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
            }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
                duration: 3000,
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
            this.getPowerList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
      //显示分配路由页面
      allotRoute: function (index, row) {
        this.allotRouteVisible = true;
        //当前被操作的管理员的主键
        this.currentPowerId = row.id;
        //根据管理员IDconsole.log(JSON.stringify(row));
        let para = {powerId : row.id};
        this.postRequest('/power/selectRouteByPowerId',para).then(resp=> {
        if (resp.data.success == 1 && resp.status == 200) {
            this.routeList = resp.data.result.routeList;
            this.radioRoute = resp.data.result.routeId;
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
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.addForm = {
          powerName: '',
          powerCode: '',
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              let power = {
                id : para.id,
                powerName: para.powerName,
                powerCode: para.powerCode,
              }
              this.postRequest('/power/updatePower',power).then(resp=> {
                if (resp.data.success == 1 && resp.status == 200) {
                    this.$message({
                      message: '编辑成功',
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
                  this.$refs['editForm'].resetFields();
                  this.editLoading = false;
                  this.editFormVisible = false;
                  this.getPowerList();
              });
            });
          }
        });
      },
      //提交分配路由给权限
      allotSubmit: function() {
        this.$confirm('确认提交吗？', '提示', {}).then(() => {
          this.allotLoading = true;
          let para = {
            powerId : this.currentPowerId,
            routeId : this.radioRoute,
          }
         this.postRequest('/power/updatePowerAndRoute',para).then(resp=> {
              if (resp.data.success == 1 && resp.status == 200) {
                  this.$message({
                    message: '分配成功',
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
                this.allotLoading = false;
                this.allotRouteVisible = false;
            });
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              let para = Object.assign({}, this.addForm);
              this.postRequest('/power/insertIntoPower',para).then(resp=> {
                if (resp.data.success == 1 && resp.status == 200) {
                    this.$message({
                      message: '新增成功',
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
                  this.$refs['addForm'].resetFields();
                  this.addLoading = false;
                  this.addFormVisible = false;
                  this.getPowerList();
              });
            });
          }
        });
      },
      //批量选择
      selsChange: function (sels) {
        this.sels = sels;
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中的['+this.sels.length+']个权限吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/power/deletePowerByIds',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              this.$message({
                message: '批量删除成功',
                type: 'success'
              });
            }else if(resp.data.success == 0){
              this.$message({
                showClose: true,
                duration: 3000,
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
            this.getPowerList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getPowerList();
    }
  }

</script>

<style scoped>

</style>