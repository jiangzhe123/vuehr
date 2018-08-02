<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入路由名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRouteList">查询</el-button>
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
    <el-table :data="routeList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="路由名称" width="100">
      </el-table-column>
      <el-table-column align='center' prop="path" label="显示路径" width="120">
      </el-table-column>
      <el-table-column align='center' prop="parentId" label="父类ID" width="80">
      </el-table-column>
      <el-table-column align='center' prop="parentRoute.name" label="父类名称" width="100">
      </el-table-column>
      <el-table-column align='center' prop="component" label="页面路径" width="220">
      </el-table-column>
      <el-table-column align='center' prop="code" label="路由标识" width="80">
      </el-table-column>
      <el-table-column align='center' prop="iconClass" label="路由图标" width="140">
      </el-table-column>
      <el-table-column align='center' label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="根路径" prop="title">
          <el-input disabled v-model="editForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="显示路径" prop="path">
          <el-input v-model="editForm.path" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="父类ID" prop="parentId">
          <el-input v-model="editForm.parentId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="页面路径" prop="component">
          <el-input v-model="editForm.component" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路由标识" prop="code">
          <el-input v-model="editForm.code" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路由图标" prop="iconClass">
          <el-input v-model="editForm.iconClass" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="根路径" prop="title">
          <el-input disabled v-model="addForm.title" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="显示路径" prop="path">
          <el-input v-model="addForm.path" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="父类ID" prop="parentId">
          <el-input v-model="addForm.parentId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="页面路径" prop="component">
          <el-input v-model="addForm.component" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路由标识" prop="code">
          <el-input v-model="addForm.code" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路由图标" prop="iconClass">
          <el-input v-model="addForm.iconClass" auto-complete="off"></el-input>
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
        routeList: [],
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
          name: [{ 
            required: true, 
            message: '请输入路由名称', 
            trigger: 'blur' 
          }],
          path: [{ 
            required: true, 
            message: '请输入路由显示路径', 
            trigger: 'blur' 
          }],
          parentId: [{ 
            required: true, 
            message: '请输入路由父类ID', 
            trigger: 'blur' 
          }],
          component: [{ 
            required: true, 
            message: '请输入路由跳转路径', 
            trigger: 'blur' 
          }],
          iconClass: [{ 
            required: true, 
            message: '请输入路由图标样式', 
            trigger: 'blur' 
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name : '',
          title : '/',
          path : '',
          parentId : '',
          component : '',
          code : '',
          iconClass : '',
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ 
            required: true, 
            message: '请输入路由名称', 
            trigger: 'blur' 
          }],
          path: [{ 
            required: true, 
            message: '请输入路由显示路径', 
            trigger: 'blur' 
          }],
          parentId: [{ 
            required: true, 
            message: '请输入路由父类ID', 
            trigger: 'blur' 
          }],
          component: [{ 
            required: true, 
            message: '请输入路由跳转路径', 
            trigger: 'blur' 
          }],
          iconClass: [{ 
            required: true, 
            message: '请输入路由图标样式', 
            trigger: 'blur' 
          }],
        },
        //新增初始化界面数据
        addForm: {
          name : '',
          title : '/',
          path : '',
          parentId : '',
          component : '',
          code : '',
          iconClass : '',
        }
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getRouteList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getRouteList();
      },
      //获取用户列表
      getRouteList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
        };
        this.listLoading = true;
        this.postRequest('/route/selectAllRoute',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.routeList = data.routeList;
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
        this.$confirm('确认删除该路由?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/route/deleteRouteByIds',para).then(resp=> {
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
            this.getRouteList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.addForm = {
          name : '',
          title : '/',
          path : '',
          parentId : '',
          component : '',
          code : '',
          iconClass : '',
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              let route = {
                id: para.id,
                name : para.name,
                title : para.title,
                path : para.path,
                parentId : para.parentId,
                component : para.component,
                code : para.code,
                iconClass : para.iconClass,
              };
              this.postRequest('/route/updateRoute',route).then(resp=> {
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
                  this.getRouteList();
              });
            });
          }
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              let para = Object.assign({}, this.addForm);
              this.postRequest('/route/insertIntoRoute',para).then(resp=> {
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
                  this.getRouteList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个路由吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/route/deleteRouteByIds',para).then(resp=> {
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
            this.getRouteList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getRouteList();
    }
  }

</script>

<style scoped>

</style>