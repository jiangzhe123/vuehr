<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入仪器名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getApparatusList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1 || roleNumber==2" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table stripe :data="apparatusList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="仪器名称" width="100">
      </el-table-column>
      <el-table-column align='center' prop="appPrice" label="使用价格" width="100">
      </el-table-column>
      <el-table-column align='center' prop="appPosition" label="仪器位置" width="120">
      </el-table-column>
      <el-table-column align='center' prop="apparatusClassify.name" label="所属分类" width="90">
      </el-table-column>
      <el-table-column align='center' prop="appState" label="仪器状态" width="80" :formatter="formatAppState">
      </el-table-column>
      <el-table-column align='center' label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="120px" :rules="editFormRules" ref="editForm">
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="使用价格" prop="appPrice">
          <el-input v-model="editForm.appPrice" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="仪器位置" prop="appPosition">
          <el-input v-model="editForm.appPosition" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="classifyId">
          <el-select v-model="editForm.classifyId" placeholder="请选择分类">
            <el-option
              v-for="item in appClassifyList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>    
        <el-form-item label="仪器状态" prop="appState">
          <el-radio-group v-model="editForm.appState">
            <el-radio class="radio" :label="1">正常</el-radio>
            <el-radio class="radio" :label="0">损坏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="120px" :rules="addFormRules" ref="addForm">
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="使用价格" prop="appPrice">
          <el-input v-model="addForm.appPrice" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="仪器位置" prop="appPosition">
          <el-input v-model="addForm.appPosition" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="classifyId">
          <el-select v-model="addForm.classifyId" placeholder="请选择分类">
            <el-option
              v-for="item in appClassifyList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>    
        <el-form-item label="仪器状态" prop="appState">
          <el-radio-group v-model="addForm.appState">
            <el-radio class="radio" :label="1">正常</el-radio>
            <el-radio class="radio" :label="0">损坏</el-radio>
          </el-radio-group>
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
        apparatusList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        //查询仪器分类
        appClassifyList: [],

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,//编辑界面的提交按钮加载
        editFormRules: {
          name: [{ 
            required: true, 
            message: '请输入仪器名称', 
            trigger: 'blur' 
          }],
          appPrice: [{ 
            required: true, 
            message: '请输入仪器使用价格', 
            trigger: 'blur' 
          }],
          appPosition: [{ 
            required: true, 
            message: '请输入仪器所在位置', 
            trigger: 'blur' 
          }],
          classifyId: [{ 
            required: true, 
            message: '请选择仪器分类', 
            trigger: 'blur' 
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name: '',
          appPrice: '',
          appPosition: '',
          classifyId: '',
          appState: 1,
        },    

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ 
            required: true, 
            message: '请输入仪器名称', 
            trigger: 'blur' 
          }],
          appPrice: [{ 
            required: true, 
            message: '请输入仪器使用价格', 
            trigger: 'blur' 
          }],
          appPosition: [{ 
            required: true, 
            message: '请输入仪器所在位置', 
            trigger: 'blur' 
          }],
          classifyId: [{ 
            required: true, 
            message: '请选择仪器分类', 
            trigger: 'blur' 
          }],
        },
        //新增初始化界面数据
        addForm: {
          name: '',
          appPrice: '',
          appPosition: '',
          classifyId: '',
          appState: 1,
        }
      }
    },
    methods: {
      //仪器状态转化
      formatAppState: function (row, column) {
        return row.appState == 1 ? '正常' : row.appState == 0 ? '损坏' : '未知';
      },
      //修改当前页  从新加载数据
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getApparatusList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getApparatusList();
      },
      //获取用户列表
      getApparatusList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
          orderByClause: "appPrice desc",
        };
        this.listLoading = true;
        this.postRequest('/apparatus/selectAllApparatus',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.apparatusList = data.apparatusList;
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
        this.$confirm('确认删除该医师?', '提示', {
          type: 'warning'
        }).then(() => {
         this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/apparatus/deleteApparatusByIds',para).then(resp=> {
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
              this.getApparatusList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.getAppClassifyList();
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.getAppClassifyList();
        this.addForm = {
          name: '',
          appPrice: '',
          appPosition: '',
          classifyId: '',
          appState: 1,
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              delete para.apparatusClassify;
              this.postRequest('/apparatus/updateApparatus',para).then(resp=> {
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
                this.getApparatusList();
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
              this.postRequest('/apparatus/insertIntoApparatus',para).then(resp=> {
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
                this.getApparatusList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个仪器吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/apparatus/deleteApparatusByIds',para).then(resp=> {
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
            this.getApparatusList();
          });
        }).catch(() => {

        });
      },
      getAppClassifyList() {
      this.postRequest('/apparatus/selectAllAppClassifyList').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.appClassifyList = data.appClassifyList;
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
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getApparatusList();
    }
  }

</script>

<style scoped>

</style>