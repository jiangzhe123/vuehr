<template>
  <section>
    <!--工具条-->
    <el-col :span="20" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入角色名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">查询</el-button>
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
    <el-table :data="roleList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="roleName" label="角色名称" width="150">
      </el-table-column>
      <el-table-column align='center' prop="roleCode" label="角色标识符" width="150">
      </el-table-column>
      <el-table-column align='center' label="操作" width="230">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="success" size="small" v-if="roleNumber==1" @click="allotPower(scope.$index, scope.row)">分配</el-button>
          <el-button type="danger" v-if="roleNumber==1" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="danger" v-if="roleNumber==0" size="small">无权限操作</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="roleCode">
          <el-input v-model="editForm.roleCode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--分配权限界面-->
    <el-dialog title="分配权限" :visible.sync="allotPowerVisible" :close-on-click-modal="false">
      <el-checkbox-group v-model="checkList">
        <template v-for="item in powerList">
          <el-checkbox :label="item.id" :key="item.id" border>
          {{item.powerName}}</el-checkbox>
        </template>  
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="allotPowerVisible = false">取消</el-button>
        <el-button type="primary" @click.native="allotSubmit" :loading="allotLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="roleCode">
          <el-input v-model="addForm.roleCode" auto-complete="off"></el-input>
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
  export default {
    data() {
      return {
        filters: {
          text: ''
        },
        roleList: [],
        total: 0,
        page: 1,
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          roleName: '',
          roleCode: '',
        },

        allotPowerVisible: false,//分配权限界面是否显示
        allotLoading: false,//提交的加载显示框
        powerList: [], //查询全部权限信息
        checkList: [], //默认选中的powerIds
        currentRoleId: '',//定义当前被操作管理员的ID

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]
        },
        //新增初始化界面数据
        addForm: {
          roleName: '',
          roleCode: '',
        }
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.page = val;
        this.getRoleList();
      },
      //获取用户列表
      getRoleList() {
        let para = {
          roleName: this.filters.text,
        };
        this.listLoading = true;
        this.postRequest('/role/selectAllRole',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result.data;
            this.total = data.length;            
            this.roleList = data;
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
        this.$confirm('确认删除该角色?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/role/deleteRoleByIds',para).then(resp=> {
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
            this.getRoleList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
      //显示分配权限页面
      allotPower: function (index, row) {
        this.allotPowerVisible = true;
        //当前被操作的管理员的主键
        this.currentRoleId = row.id;
        //根据管理员IDconsole.log(JSON.stringify(row));
        let para = {roleId : row.id};
        this.postRequest('/role/selectPowerIdsByRoleId',para).then(resp=> {
        if (resp.data.success == 1 && resp.status == 200) {
            this.powerList = resp.data.result.powerList;
            this.checkList = resp.data.result.powerIds;
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
          roleName: '',
          roleCode: '',
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              let role = {
                id : para.id,
                roleName: para.roleName,
                roleCode: para.roleCode,
              }
              this.postRequest('/role/updateRole',role).then(resp=> {
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
                  this.getRoleList();
              });
            });
          }
        });
      },
      //提交分配权限给角色
      allotSubmit: function() {
        this.$confirm('确认提交吗？', '提示', {}).then(() => {
          this.allotLoading = true;
          let para = {
            roleId : this.currentRoleId,
            powerIds : this.checkList,
          }
         this.postRequest('/role/insertIntoRoleAndPower',para).then(resp=> {
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
                this.allotPowerVisible = false;
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
              this.postRequest('/role/insertIntoRole',para).then(resp=> {
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
                  this.getRoleList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个角色吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/role/deleteRoleByIds',para).then(resp=> {
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
            this.getRoleList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getRoleList();
    }
  }

</script>

<style scoped>

</style>