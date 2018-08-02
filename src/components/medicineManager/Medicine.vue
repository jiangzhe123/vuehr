<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入药品名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMedicineList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1 || roleNumber==2" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-upload
            :show-file-list="false"
            accept="application/vnd.ms-excel"
            action="http://118.89.246.66:8080/medicine/importMedicineList"
            :on-success="fileUploadSuccess"
            :on-error="fileUploadError" :disabled="fileUploadBtnText=='正在导入'"
            :before-upload="beforeFileUpload">
            <el-button v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" type="success" :loading="fileUploadBtnText=='正在导入'"><i class="fa fa-lg fa-level-up"></i>{{fileUploadBtnText}}
            </el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" type="success" @click="exportMedicine"><i class="fa fa-lg fa-level-down"></i>导出数据
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table stripe :data="medicineList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="药品名称" width="150">
      </el-table-column>
      <el-table-column align='center' prop="salePrice" label="药品价格" width="100">
      </el-table-column>
      <el-table-column align='center' prop="inventory" label="库存" width="80">
      </el-table-column>
      <el-table-column align='center' prop="inventoryWarn" label="预警库存" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicineClassify.name" label="分类" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicineUnit.name" label="单位" width="60">
      </el-table-column>
      <el-table-column align='center' prop="medicineFactory.name" label="厂家名称" width="150">
      </el-table-column>
      <el-table-column align='center' label="操作" width="180">
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
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="salePrice">
          <el-input v-model="editForm.salePrice" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="库存" prop="inventory">
          <el-input v-model="editForm.inventory" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="预警库存" prop="inventoryWarn">
          <el-input v-model="editForm.inventoryWarn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="药品摘要" prop="remark">
          <el-input v-model="editForm.remark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="药品概述" prop="description">
          <el-input v-model="editForm.description" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="classifyId">
          <el-select v-model="editForm.classifyId" placeholder="请选择分类">
            <el-option
              v-for="item in classifyList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药品单位" prop="unitId">
          <el-select v-model="editForm.unitId" placeholder="请选择单位">
            <el-option
              v-for="item in unitList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药品厂家" prop="factoryId">
          <el-select v-model="editForm.factoryId" placeholder="请选择厂家">
            <el-option
              v-for="item in factoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
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
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="salePrice">
          <el-input v-model="addForm.salePrice" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="库存" prop="inventory">
          <el-input v-model="addForm.inventory" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="预警库存" prop="inventoryWarn">
          <el-input v-model="addForm.inventoryWarn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="药品摘要" prop="remark">
          <el-input v-model="addForm.remark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="药品概述" prop="description">
          <el-input v-model="addForm.description" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="classifyId">
          <el-select v-model="addForm.classifyId" placeholder="请选择分类">
            <el-option
              v-for="item in classifyList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药品单位" prop="unitId">
          <el-select v-model="addForm.unitId" placeholder="请选择单位">
            <el-option
              v-for="item in unitList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药品厂家" prop="factoryId">
          <el-select v-model="addForm.factoryId" placeholder="请选择厂家">
            <el-option
              v-for="item in factoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
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
        medicineList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,
        //excel
        fileUploadBtnText: '导入数据',

        //查询下拉选框部分之 分类、厂家、单位集合信息
        classifyList: [],
        factoryList: [],
        unitList: [],

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,//编辑界面的提交按钮加载
        editFormRules: {
          name: [{ 
            required: true, 
            message: '请输入药品名称', 
            trigger: 'blur' 
          }],
          salePrice: [{ 
            required: true, 
            message: '请输入药品单价', 
            trigger: 'blur' 
          }],
          inventory: [{ 
            required: true, 
            message: '请输入药品库存数量', 
            trigger: 'blur' 
          },{
            pattern: /^(?!0)(?:[0-9]{1,3}|1000)$/,
            message: '请输入大于>1小于<1000的药品库存数量'
          }],
          inventoryWarn: [{ 
            required: true, 
            message: '请输入药品预警库存数量', 
            trigger: 'blur' 
          },{
            pattern: /^(?!0)(?:[0-9]{1,2}|100)$/,
            message: '请输入大于>1小于<100的药品预警库存数量'
          }],
          remark: [{ 
            required: true, 
            message: '请输入药品摘要', 
            trigger: 'blur' 
          }],
          description: [{ 
            required: true, 
            message: '请输入药品描述', 
            trigger: 'blur' 
          }],
          classifyId: [{ 
            required: true, 
            message: '请选择分类', 
            trigger: 'blur' 
          }],
          unitId: [{ 
            required: true, 
            message: '请选择单位', 
            trigger: 'blur' 
          }],
          factoryId: [{ 
            required: true, 
            message: '请选择厂家', 
            trigger: 'blur' 
          }],
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name: '',
          salePrice: '',
          inventory: '',
          inventoryWarn: '',
          remark: '',
          description: '',
          classifyId: '',
          unitId: '',
          factoryId: '',
        },    

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ 
            required: true, 
            message: '请输入药品名称', 
            trigger: 'blur' 
          }],
          salePrice: [{ 
            required: true, 
            message: '请输入药品单价', 
            trigger: 'blur' 
          }],
          inventory: [{ 
            required: true, 
            message: '请输入药品库存数量', 
            trigger: 'blur' 
          },{
            pattern: /^(?!0)(?:[0-9]{1,3}|1000)$/,
            message: '请输入大于>1小于<1000的药品库存数量'
          }],
          inventoryWarn: [{ 
            required: true, 
            message: '请输入药品预警库存数量', 
            trigger: 'blur' 
          },{
            pattern: /^(?!0)(?:[0-9]{1,2}|100)$/,
            message: '请输入大于>1小于<100的药品预警库存数量'
          }],
          remark: [{ 
            required: true, 
            message: '请输入药品摘要', 
            trigger: 'blur' 
          }],
          description: [{ 
            required: true, 
            message: '请输入药品描述', 
            trigger: 'blur' 
          }],
          classifyId: [{ 
            required: true, 
            message: '请选择分类', 
            trigger: 'blur' 
          }],
          unitId: [{ 
            required: true, 
            message: '请选择单位', 
            trigger: 'blur' 
          }],
          factoryId: [{ 
            required: true, 
            message: '请选择厂家', 
            trigger: 'blur' 
          }],
        },
        //新增初始化界面数据
        addForm: {
          name: '',
          salePrice: '',
          inventory: '',
          inventoryWarn: '',
          remark: '',
          description: '',
          classifyId: '',
          unitId: '',
          factoryId: '',
        }
      }
    },
    methods: {
      //修改当前页  从新加载数据
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getMedicineList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getMedicineList();
      },
      //获取用户列表
      getMedicineList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
        };
        this.listLoading = true;
        this.postRequest('/medicine/selectAllMedicine',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.total = data.totalNum;            
            this.medicineList = data.medicineList;
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
        this.$confirm('确认删除该药品?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/medicine/deleteMedicineByIds',para).then(resp=> {
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
            this.getMedicineList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.getMedicineOtherCon();
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.getMedicineOtherCon();
        this.addForm = {
          name: '',
          salePrice: '',
          inventory: '',
          inventoryWarn: '',
          remark: '',
          description: '',
          classifyId: '',
          unitId: '',
          factoryId: '',
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = Object.assign({}, this.editForm);
              let medicine = {
                id: para.id,
                name: para.name,
                salePrice: para.salePrice,
                inventory: para.inventory,
                inventoryWarn: para.inventoryWarn,
                remark: para.remark,
                description: para.description,
                classifyId: para.classifyId,
                unitId: para.unitId,
                factoryId: para.factoryId,
              }
              this.postRequest('/medicine/updateMedicine',medicine).then(resp=> {
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
                  this.getMedicineList();
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
              this.postRequest('/medicine/insertIntoMedicine',para).then(resp=> {
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
                  this.getMedicineList();
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
        this.$confirm('确认删除选中的['+this.sels.length+']个药品？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/medicine/deleteMedicineByIds',para).then(resp=> {
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
            this.getMedicineList();
          });
        }).catch(() => {

        });
      },
      getMedicineOtherCon() {
      this.postRequest('/medicine/selectMedicineOption').then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
            var data = resp.data.result;
            this.classifyList = data.classifyList;
            this.factoryList = data.factoryList;
            this.unitList = data.unitList;
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
      fileUploadSuccess(response, file, fileList){
        this.$message({type: 'success', message: "导入成功!"});
        this.getMedicineList();
        this.fileUploadBtnText = '导入数据';
      },
      fileUploadError(err, file, fileList){
        this.$message({type: 'error', message: "导入失败!"});
        this.fileUploadBtnText = '导入数据';
      },
      beforeFileUpload(file){
        this.fileUploadBtnText = '正在导入';
      },
      exportMedicine(){
        window.open("http://118.89.246.66:8080/medicine/exportMedicine", "_parent");
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getMedicineList();
    }
  }

</script>

<style scoped>

</style>