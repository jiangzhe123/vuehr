<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入患者姓名查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getPatientList">查询</el-button>
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
    <el-table stripe :data="patientList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="患者姓名" width="100">
      </el-table-column>
      <el-table-column align='center' prop="phone" label="手机号" width="120">
      </el-table-column>
      <el-table-column align='center' prop="sex" label="性别" width="60" :formatter="formatSex">
      </el-table-column>
      <el-table-column align='center' prop="birthdayStr" label="生日" width="150">
      </el-table-column>
      <el-table-column align='center' prop="familyPhone" label="亲人手机号" width="120">
      </el-table-column>
      <el-table-column align='center' prop="patientState" label="患者状态" :formatter="formatPatientState" width="80">
      </el-table-column>
      <el-table-column align='center' prop="createDateStr" label="入院时间" width="150">
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
        <el-form-item label="患者姓名" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" auto-complete="off"></el-input>
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
        <el-form-item label="身份证号" prop="identity">
          <el-input v-model="editForm.identity" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="亲属手机号" prop="familyPhone">
          <el-input v-model="editForm.familyPhone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="亲属关系" prop="familyContactId">
          <el-select v-model="editForm.familyContactId" placeholder="请选择">
            <el-option
              v-for="item in familycontactList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属科室" prop="departmentId">
          <el-select v-model="editForm.departmentId" placeholder="请选择科室" @change="selectDoctorByDepartmentId">
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主治医师" prop="doctorId">
          <el-select v-model="editForm.doctorId" placeholder="请选择">
            <el-option
              v-for="item in doctorList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>    
        <el-form-item label="过敏史" prop="allergy">
          <el-input v-model="editForm.allergy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="患者状态" prop="patientState">
          <el-radio-group v-model="editForm.patientState">
            <el-radio class="radio" :label="-1" border>无病床</el-radio>
            <el-radio class="radio" :label="0" border>有病床</el-radio>
            <el-radio class="radio" :label="1" border>已出院</el-radio>
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
        <el-form-item label="患者姓名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" auto-complete="off"></el-input>
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
        <el-form-item label="身份证号" prop="identity">
          <el-input v-model="addForm.identity" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="亲属手机号" prop="familyPhone">
          <el-input v-model="addForm.familyPhone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="亲属关系" prop="familyContactId">
          <el-select v-model="addForm.familyContactId" placeholder="请选择">
            <el-option
              v-for="item in familycontactList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属科室" prop="departmentId">
          <el-select v-model="addForm.departmentId" placeholder="请选择科室" @change="selectDoctorByDepartmentId">
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主治医师" prop="doctorId">
          <el-select v-model="addForm.doctorId" placeholder="请选择">
            <el-option
              v-for="item in doctorList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>    
        <el-form-item label="过敏史" prop="allergy">
          <el-input v-model="addForm.allergy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="患者状态" prop="patientState">
          <el-radio-group v-model="addForm.patientState">
            <el-radio class="radio" :label="-1" border>无病床</el-radio>
            <el-radio class="radio" :label="0" border>有病床</el-radio>
            <el-radio class="radio" :label="1" border>已出院</el-radio>
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
  import dateUtil1 from '../../utils/filter_utils'
  import dateUtil2 from '../../utils/dateUtil'
  export default {
    data() {
      return {
        filters: {
          text: ''
        },
        patientList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        //查询科室+专业+医师资格 下拉选框集合信息
        departmentList: [],
        familycontactList: [],
        doctorList: [],

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,//编辑界面的提交按钮加载
        editFormRules: {
          name: [{ 
            required: true, 
            message: '请输入患者姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '患者姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入患者本人的手机号码', 
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
          birthdayStr: [{ 
            required: true, 
            message: '请选择患者出生日期', 
            trigger: 'blur' 
          }],
          identity: [{ 
            required: true, 
            message: '请输入患者身份证号', 
            trigger: 'blur' 
          },{
            pattern:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
            message: '患者身份证号格式不正确' 
          }],
          familyPhone: [{ 
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
          familyContactId: [{ 
            required: true, 
            message: '请选择家庭联系人类型', 
            trigger: 'blur' 
          }],
          departmentId: [{ 
            required: true, 
            message: '请选择科室', 
            trigger: 'blur' 
          }],
          allergy: [{ 
            required: true, 
            message: '请输入患者过敏史', 
            trigger: 'blur' 
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name: '',
          phone: '',
          sex: 1,
          birthdayStr: '',
          identity: '',
          familyPhone: '',
          familyContactId: '',
          departmentId: '',
          doctorId: '',
          allergy: '',
          patientState: 0,
        },    

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ 
            required: true, 
            message: '请输入患者姓名', 
            trigger: 'blur' 
          },{
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符'
          },{
            pattern: /^[\u4E00-\u9FA5]+$/,
            message: '患者姓名只能为中文'
          }],
          phone: [{ 
            required: true, 
            message: '请输入患者本人的手机号码', 
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
          birthdayStr: [{ 
            required: true, 
            message: '请选择患者出生日期', 
            trigger: 'blur' 
          }],
          identity: [{ 
            required: true, 
            message: '请输入患者身份证号', 
            trigger: 'blur' 
          },{
            pattern:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
            message: '患者身份证号格式不正确' 
          }],
          familyPhone: [{ 
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
          familyContactId: [{ 
            required: true, 
            message: '请选择家庭联系人类型', 
            trigger: 'blur' 
          }],
          departmentId: [{ 
            required: true, 
            message: '请选择科室', 
            trigger: 'blur' 
          }],
          allergy: [{ 
            required: true, 
            message: '请输入患者过敏史', 
            trigger: 'blur' 
          }],
        },
        //新增初始化界面数据
        addForm: {
          name: '',
          phone: '',
          sex: 1,
          birthdayStr: '',
          identity: '',
          familyPhone: '',
          familyContactId: '',
          departmentId: '',
          doctorId: '',
          allergy: '',
          patientState: 0,
        }
      }
    },
    methods: {
      //性别显示转换
      formatSex: function (row, column) {
        return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
      },
      //患者当前状态
      formatPatientState: function (row, column) {
        return row.patientState == -1 ? '无病床' : row.patientState == 0 ? '有病床' : '已出院';
      },
      //修改当前页  从新加载数据
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getPatientList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getPatientList();
      },
      //获取用户列表
      getPatientList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
          orderByClause: "createDate desc",
        };
        this.listLoading = true;
        this.postRequest('/patient/selectAllPatient',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.patientList = data.patientList;
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
        this.$confirm('确认删除该患者?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/patient/deletePatientByIds',para).then(resp=> {
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
            this.getPatientList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.selectDoctorByDepartmentId(row.departmentId);
        this.getPatientOtherCon();
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.getPatientOtherCon();
        this.addForm = {
          name: '',
          phone: '',
          sex: 1,
          birthdayStr: '',
          identity: '',
          familyPhone: '',
          familyContactId: '',
          departmentId: '',
          doctorId: '',
          allergy: '',
          patientState: 0,
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
              let patient = {
                id: para.id,
                name: para.name,
                phone: para.phone,
                sex: para.sex,
                birthdayStr: para.birthdayStr,
                identity: para.identity,
                familyPhone: para.familyPhone,
                familyContactId: para.familyContactId,
                departmentId: para.departmentId,
                doctorId: para.doctorId,
                allergy: para.allergy,
                patientState: para.patientState,
              }
              this.postRequest('/patient/updatePatient',patient).then(resp=> {
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
                  this.getPatientList();
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
              this.postRequest('/patient/insertIntoPatient',para).then(resp=> {
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
                  //格式化addForm这个对象中的属性
                  this.$refs['addForm'].resetFields();
                  this.addLoading = false;
                  this.addFormVisible = false;
                  this.getPatientList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个患者吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/patient/deletePatientByIds',para).then(resp=> {
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
            this.getPatientList();
          });
        }).catch(() => {

        });
      },
      getPatientOtherCon() {
        this.postRequest('/patient/selectFamilyAndDepartment').then(resp=> {
            if (resp.data.success == 1 && resp.status == 200) {
              var data = resp.data.result;
              this.departmentList = data.departmentList;
              this.familycontactList = data.familycontactList;
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
      selectDoctorByDepartmentId(val){
        this.postRequest('/patient/selectDoctorByDepartmentId',{departmentId:val}).then(resp=> {
            if (resp.data.success == 1 && resp.status == 200) {
              var data = resp.data.result;
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
          });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getPatientList();
    }
  }

</script>

<style scoped>

</style>