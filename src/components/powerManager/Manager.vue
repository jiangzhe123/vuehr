<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入姓名查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getManagerList">查询</el-button>
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
    <el-table :data="managerList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="userName" label="用户名" width="100">
      </el-table-column>
      <el-table-column align='center' prop="realName" label="姓名" width="80">
      </el-table-column>
      <el-table-column align='center' prop="phone" label="手机号" width="120">
      </el-table-column>
      <el-table-column align='center' prop="createDateStr" label="创建时间" width="170">
      </el-table-column>
      <el-table-column align='center' prop="lastLoginDateStr" label="最后一次登录时间" width="170">
      </el-table-column>
      <el-table-column align='center' label="操作" width="230">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="success" size="small" v-if="roleNumber==1" @click="allotRole(scope.$index, scope.row)">分配</el-button>
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

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editForm.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="editForm.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
  
    <!--分配角色-->
    <el-dialog title="分配角色" :visible.sync="allotRoleVisible" :close-on-click-modal="false">
      <el-radio-group v-model="radioRole">
        <template v-for="item in roleList">
          <el-radio :label="item.id" :key="item.id" border>
          {{item.roleName}}</el-radio>
        </template>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="allotRoleVisible = false">取消</el-button>
        <el-button type="primary" @click.native="allotSubmit" :loading="allotLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="addForm.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" auto-complete="off"></el-input>
        </el-form-item> 
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" auto-complete="off"></el-input>
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
        managerList: [],
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
          userName: [{ 
            required: true, 
            message: '请输入用户名', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '长度在 5 到 15 个字符'
          },{
            pattern:/^[a-zA-Z][a-zA-Z0-9_]{4,14}$/, 
            message: '以字母开头，长度在5-15之间， 允许字母数字下划线'
          }],
          realName: [{ 
            required: true, 
            message: '请输入管理员姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '管理员姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入管理员手机号', 
            trigger: 'blur' 
          },{
            validator:function(rule,value,callback){
              if(/^1[34578]\d{9}$/.test(value) == false){
                  callback(new Error("请输入正确的手机号"));
              }else{
                  callback();
              }
            }, trigger: 'blur'
          }],
          password: [{ 
            required: true, 
            message: '请输入密码', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '密码长度在 5 到 15 个字符'
          },{
            pattern: /^[a-zA-Z]\w{4,14}$/,
            message: '以字母开头，长度在5~15之间，只能包含字母、数字和下划线'
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          userName: '',
          realName: '',
          phone: '',
          password:''
        },

        allotRoleVisible: false,//分配角色界面是否显示
        allotLoading: false,//提交的加载显示框
        roleList: [], //查询全部角色信息
        radioRole: '', //默认选中的roleID
        currentManagerId: '',//定义当前被操作管理员的ID    

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          userName: [{ 
            required: true, 
            message: '请输入用户名', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '长度在 5 到 15 个字符'
          },{
            pattern:/^[a-zA-Z][a-zA-Z0-9_]{4,14}$/, 
            message: '以字母开头，长度在5-15之间， 允许字母数字下划线'
          }],
          realName: [{ 
            required: true, 
            message: '请输入管理员姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '管理员姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入管理员手机号', 
            trigger: 'blur' 
          },{
            validator:function(rule,value,callback){
              if(/^1[34578]\d{9}$/.test(value) == false){
                  callback(new Error("请输入正确的手机号"));
              }else{
                  callback();
              }
            }, trigger: 'blur'
          }],
          password: [{ 
            required: true, 
            message: '请输入密码', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '密码长度在 5 到 15 个字符'
          },{
            pattern: /^[a-zA-Z]\w{4,14}$/,
            message: '以字母开头，长度在5~15之间，只能包含字母、数字和下划线'
          }],
        },
        //新增初始化界面数据
        addForm: {
          userName: '',
          realName: '',
          phone: '',
          password:''
        }
      }
    },
    methods: {
      //性别显示转换
      formatSex: function (row, column) {
        return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
      },
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getManagerList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getManagerList();
      },
      //获取用户列表
      getManagerList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          realName: this.filters.text,
          orderByClause: "createDate desc",
        };
        this.listLoading = true;
        this.postRequest('/myManager/selectAllManager',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.managerList = data.managerList;
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
        this.$confirm('确认删除该管理员?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/myManager/deleteManagerByIds',para).then(resp=> {
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
            this.getManagerList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
       //显示分配角色页面
      allotRole: function (index, row) {
        this.allotRoleVisible = true;
        //当前被操作的管理员的主键
        this.currentManagerId = row.id;
        //根据管理员IDconsole.log(JSON.stringify(row));
        let para = {managerId : row.id};
        this.postRequest('/myManager/selectRoleByManagerId',para).then(resp=> {
        if (resp.data.success == 1 && resp.status == 200) {
            this.roleList = resp.data.result.roleList;
            this.radioRole = resp.data.result.roleId;
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
          userName: '',
          realName: '', 
          phone: '',
          password: ''
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              let manager = {
                id : para.id,
                userName : para.userName,
                password : para.password,
                realName : para.realName,
                phone : para.phone
              }
              this.postRequest('/myManager/updateManager',manager).then(resp=> {
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
                  this.getManagerList();
              });
            });
          }
        });
      },
      //提交分配角色给管理员
      allotSubmit: function() {
        this.$confirm('确认提交吗？', '提示', {}).then(() => {
          this.allotLoading = true;
          let para = {
            managerId : this.currentManagerId,
            roleId : this.radioRole,
          }
         this.postRequest('/myManager/updateManagerRoleByRoleId',para).then(resp=> {
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
                this.allotRoleVisible = false;
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
              this.postRequest('/myManager/insertIntoManager',para).then(resp=> {
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
                  this.getManagerList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个管理员吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/myManager/deleteManagerByIds',para).then(resp=> {
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
            this.getManagerList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getManagerList(); 
    }
  }

</script>

<style scoped>

</style>