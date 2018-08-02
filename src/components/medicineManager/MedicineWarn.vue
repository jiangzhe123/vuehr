<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入药品名称查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getLessMedicineList">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table stripe :data="medicineList" highlight-current-row v-loading="listLoading" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="name" label="药品名称" width="100">
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
      <el-table-column align='center' prop="medicineFactory.name" label="厂家名称" width="120">
      </el-table-column>
      <el-table-column align='center' label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" @click="handleEdit(scope.$index, scope.row)">增加库存</el-button>
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
        <el-form-item disabled label="药品名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="库存" prop="inventory">
          <el-input v-model="editForm.inventory" auto-complete="off"></el-input>
        </el-form-item> 
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
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

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,//编辑界面的提交按钮加载
        editFormRules: {
          name: [{ 
            required: true, 
            message: '请输入药品名称', 
            trigger: 'blur' 
          }],
          inventory: [{
            required: true, 
            message: '请输入药品库存数量', 
            trigger: 'blur'
          },{
            pattern: /^(?!0)(?:[0-9]{1,3}|1000)$/,
            message: '请输入大于>1小于<1000的药品库存数量'
          }]
        },
        //编辑初始化界面数据
        editForm: {
          id: 0,
          name: '',
          inventory: '',
        }          
      }
    },
    methods: {
      //修改当前页  从新加载数据
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getLessMedicineList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getLessMedicineList();
      },
      //获取用户列表
      getLessMedicineList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
        };
        this.listLoading = true;
        this.postRequest('/medicine/selectAllLessMedicine',para).then(resp=> {
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
     
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
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
                inventory: para.inventory,
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
                  this.getLessMedicineList();
              });
            });
          }
        });
      },
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getLessMedicineList();
    }
  }

</script>

<style scoped>

</style>