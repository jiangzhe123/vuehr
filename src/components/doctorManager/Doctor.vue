<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入医生姓名查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getDoctorList">查询</el-button>
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
    <el-table stripe :data="doctorList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="医师姓名" width="100">
      </el-table-column>
      <el-table-column align='center' prop="phone" label="手机号" width="120">
      </el-table-column>
      <el-table-column align='center' prop="sex" label="性别" width="60" :formatter="formatSex">
      </el-table-column>
      <el-table-column align='center' prop="birthdayStr" label="生日" width="150">
      </el-table-column>
      <el-table-column align='center' prop="college" label="毕业院校" width="120">
      </el-table-column>
      <el-table-column align='center' prop="education" label="学历" width="80">
      </el-table-column>
      <el-table-column align='center' prop="createDateStr" label="创建时间" width="150">
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
        <el-form-item label="医师姓名" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="editForm.sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthdayStr">
          <el-date-picker v-model="editForm.birthdayStr" 
          type="datetime" placeholder="选择出生日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="医师资格证号" prop="qualificationNum">
          <el-input v-model="editForm.qualificationNum" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属科室" prop="departmentId">
          <el-select v-model="editForm.departmentId" placeholder="请选择科室">
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医师资格" prop="qualificationId">
          <el-select v-model="editForm.qualificationId" placeholder="请选择资格">
            <el-option
              v-for="item in qualificationList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专修专业" prop="majorId">
          <el-select v-model="editForm.majorId" placeholder="请选择专业">
            <el-option
              v-for="item in majorList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>     
        <el-form-item label="毕业院校" prop="college">
          <el-input v-model="editForm.college" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-input v-model="editForm.education" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="擅长" prop="goodAt">
          <el-input v-model="editForm.goodAt" auto-complete="off"></el-input>
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
        <el-form-item label="医师姓名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="addForm.sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthdayStr">
          <el-date-picker v-model="addForm.birthdayStr" 
          type="datetime" placeholder="选择出生日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="医师资格证号" prop="qualificationNum">
          <el-input v-model="addForm.qualificationNum" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属科室" prop="departmentId">
          <el-select v-model="addForm.departmentId" placeholder="请选择科室">
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医师资格" prop="qualificationId">
          <el-select v-model="addForm.qualificationId" placeholder="请选择医师资格">
            <el-option
              v-for="item in qualificationList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专修专业" prop="majorId">
          <el-select v-model="addForm.majorId" placeholder="请选择专业">
            <el-option
              v-for="item in majorList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>     
        <el-form-item label="毕业院校" prop="college">
          <el-input v-model="addForm.college" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-input v-model="addForm.education" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="擅长" prop="goodAt">
          <el-input v-model="addForm.goodAt" auto-complete="off"></el-input>
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
  import dateUtil2 from '../../utils/dateUtil'
  export default {
    data() {
      return {
        filters: {
          text: ''
        },
        doctorList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        //查询科室+专业+医师资格 下拉选框集合信息
        departmentList: [],
        qualificationList: [],
        majorList: [],

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,//编辑界面的提交按钮加载
        editFormRules: {
          name: [{ 
            required: true, 
            message: '请输入医师姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '医师姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入手机号码', 
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
          email: [{ 
            required: true, 
            message: '请输入邮箱地址', 
            trigger: 'blur' 
          },{
            type: 'email',
            message: '邮箱格式不正确',
            trigger: 'blur'
          }],
          birthdayStr: [{ 
            required: true, 
            message: '请选择出生日期', 
            trigger: 'blur' 
          }],
          qualificationNum: [{ 
            required: true, 
            message: '请输入资格证号', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '请输入 5 到 15 个数字'
          },{
            pattern: /^(0|[1-9][0-9]*)$/,
            message: '请输入纯数字'
          }],
          departmentId: [{ 
            required: true, 
            message: '请选择科室', 
            trigger: 'blur' 
          }],
          qualificationId: [{ 
            required: true, 
            message: '请选择资格', 
            trigger: 'blur' 
          }],
          majorId: [{ 
            required: true, 
            message: '请选择专业', 
            trigger: 'blur' 
          }],
          college: [{ 
            required: true, 
            message: '请输入大学名称', 
            trigger: 'blur' 
          }],
          education: [{ 
            required: true, 
            message: '请输入专业名称', 
            trigger: 'blur' 
          }],
          goodAt: [{ 
            required: true, 
            message: '请输入擅长症状', 
            trigger: 'blur' 
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name: '',
          phone: '',
          email: '',
          sex: 1,
          birthdayStr: '',
          qualificationNum: '',
          departmentId: '',
          qualificationId: '',
          majorId: '',
          college: '',
          education: '',
          goodAt: '',
        },    

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ 
            required: true, 
            message: '请输入医师姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '医师姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入手机号码', 
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
          email: [{ 
            required: true, 
            message: '请输入邮箱地址', 
            trigger: 'blur' 
          },{
            type: 'email',
            message: '邮箱格式不正确',
            trigger: 'blur'
          }],
          birthdayStr: [{ 
            required: true, 
            message: '请选择出生日期', 
            trigger: 'blur' 
          }],
          qualificationNum: [{ 
            required: true, 
            message: '请输入资格证号', 
            trigger: 'blur' 
          },{
            min: 5,
            max: 15,
            message: '请输入 5 到 15 个数字'
          },{
            pattern: /^(0|[1-9][0-9]*)$/,
            message: '请输入纯数字'
          }],
          departmentId: [{ 
            required: true, 
            message: '请选择科室', 
            trigger: 'blur' 
          }],
          qualificationId: [{ 
            required: true, 
            message: '请选择资格', 
            trigger: 'blur' 
          }],
          majorId: [{ 
            required: true, 
            message: '请选择专业', 
            trigger: 'blur' 
          }],
          college: [{ 
            required: true, 
            message: '请输入大学名称', 
            trigger: 'blur' 
          }],
          education: [{ 
            required: true, 
            message: '请输入专业名称', 
            trigger: 'blur' 
          }],
          goodAt: [{ 
            required: true, 
            message: '请输入擅长症状', 
            trigger: 'blur' 
          }],
        },
        //新增初始化界面数据
        addForm: {
          name: '',
          phone: '',
          email: '',
          sex: 1,
          birthdayStr: '',
          qualificationNum: '',
          departmentId: '',
          qualificationId: '',
          majorId: '',
          college: '',
          education: '',
          goodAt: '',
        }
      }
    },
    methods: {
      //性别显示转换
      formatSex: function (row, column) {
        return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
      },
      //修改当前页  从新加载数据
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getDoctorList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getDoctorList();
      },
      //获取用户列表
      getDoctorList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
          orderByClause: "createDate desc",
        };
        this.listLoading = true;
        this.postRequest('/doctor/selectAllDoctor',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.doctorList = data.doctorList;
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
         this.postRequest('/doctor/deleteDoctorByIds',para).then(resp=> {
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
            this.getDoctorList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.getDoctorOtherCon();
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.getDoctorOtherCon();
        this.addForm = {
          name: '',
          phone: '',
          email: '',
          sex: 1,
          birthdayStr: '',
          qualificationNum: '',
          departmentId: '',
          qualificationId: '',
          majorId: '',
          college: '',
          education: '',
          goodAt: '',
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              para.birthdayStr = (!para.birthdayStr || para.birthdayStr == '') ? '' : dateUtil2.formatDate.format(new Date(para.birthdayStr), 'yyyy-MM-dd hh:mm:ss');
              let doctor = {
                id : para.id,
                name: para.name,
                phone: para.phone,
                email: para.email,
                sex: para.sex,
                birthdayStr: para.birthdayStr,
                qualificationNum: para.qualificationNum,
                departmentId: para.departmentId,
                qualificationId: para.qualificationId,
                majorId: para.majorId,
                college: para.college,
                education: para.education,
                goodAt: para.goodAt,
              }
              this.postRequest('/doctor/updateDoctor',doctor).then(resp=> {
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
                  this.getDoctorList();
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
              para.birthdayStr = (!para.birthdayStr || para.birthdayStr == '') ? '' : dateUtil2.formatDate.format(new Date(para.birthdayStr), 'yyyy-MM-dd hh:mm:ss');
              this.postRequest('/doctor/insertIntoDoctor',para).then(resp=> {
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
                  this.getDoctorList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个医师吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/doctor/deleteDoctorByIds',para).then(resp=> {
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
            this.getDoctorList();
          });
        }).catch(() => {

        });
      },
      getDoctorOtherCon() {
      this.postRequest('/doctor/selectDoctorOtherCon').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.departmentList = data.departmentList;
            this.qualificationList = data.qualificationList;
            this.majorList = data.doctorMajorList;
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
      this.getDoctorList();
    }
  }

</script>

<style scoped>

</style>