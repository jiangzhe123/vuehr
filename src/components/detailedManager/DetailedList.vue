<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.text" placeholder="请输入患者名称、手机号查询"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getDetailedList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" v-if="roleNumber==1 || roleNumber==2" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="detailedList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column align='center' type="selection" width="60">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="patient.name" label="患者名称" width="80">
      </el-table-column>
      <el-table-column align='center' prop="patient.phone" label="手机号" width="120">
      </el-table-column>
      <el-table-column align='center' prop="patient.sex" label="性别" width="60" :formatter="formatSex">
      </el-table-column>
      <el-table-column align='center' prop="patient.department.name" label="所属科室" width="100">
      </el-table-column>
      <el-table-column align='center' prop="patient.patientState" label="患者状态" :formatter="formatPatientState" width="80">
      </el-table-column>
      <el-table-column align='center' prop="patient.createDateStr" label="入院时间" width="150">
      </el-table-column>
      <el-table-column align='center' prop="detailedDateStr" label="清单时间" width="150">
      </el-table-column>
      <el-table-column align='center' prop="totalPrice" label="总金额" width="100">
      </el-table-column>
      <el-table-column align='center' label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="primary" size="small" v-if="roleNumber==1 || roleNumber==2 || roleNumber==3" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
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
    <el-dialog title="查看清单详情" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-table :data="detailedMedicineList" highlight-current-row style="width: 100%;">
      <el-table-column align='center' type="index" label="编号" width="60">
      </el-table-column>
      <el-table-column align='center' prop="medicine.name" label="药品名称" width="150">
      </el-table-column>
      <el-table-column align='center' prop="medicine.medicineClassify.name" label="药品分类" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicine.salePrice" label="药品单价" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicine.medicineUnit.name" label="药品单位" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicineNum" label="药品数量" width="80">
      </el-table-column>
      <el-table-column align='center' prop="medicinePrice" label="总金额" width="80">
      </el-table-column>
    </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click.native="enSure">确定</el-button>
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
        detailedList: [],
        total: 0,//总共多少条数据
        pageNum: 1,//当前是第几页
        pageSize: 5,//每页多少条数据
        listLoading: false,
        sels: [],//列表选中列  批量删除用的
        //从路由信息中得到的  用于判断当前管理员 可管理的按钮
        roleNumber: this.store.state.roleNumber,

        editFormVisible: false,//编辑界面是否显示
        detailedMedicineList: []
      }
    },
    methods: {
      //性别显示转换
      formatSex: function (row, column) {
        return row.patient.sex == 1 ? '男' : row.patient.sex == 0 ? '女' : '未知';
      },
      //患者当前状态
      formatPatientState: function (row, column) {
        return row.patient.patientState == -1 ? '无病床' : row.patient.patientState == 0 ? '有病床' : '已出院';
      },
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getDetailedList();
      },
      //修改每页size
      handleSizeChange(val) {
        this.pageSize = val;
        this.getDetailedList();
      },
      //获取科室列表
      getDetailedList() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.filters.text,
          phone: this.filters.text,
          orderByClause: "detailedDate desc"
        };
        this.listLoading = true;
        this.postRequest('/detailedList/selectAllDetailedList',para).then(resp=> {
          if (resp.data.success == 1 && resp.status == 200) {
              var data = resp.data.result;
              this.total = data.totalNum;            
              this.detailedList = data.detailedList;
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
        this.$confirm('确认删除该清单?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
         let para = {ids : [row.id] };
         this.postRequest('/detailedList/deleteDetailedListByIds',para).then(resp=> {
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
            this.getDetailedList();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        var detailed = Object.assign({}, row);
        this.detailedMedicineList = detailed.detailedMedicineList;
      },
      //编辑页面确认按钮
      enSure: function(){
        this.editFormVisible = false;
        this.detailedMedicineList = [];
      },
      //批量选择
      selsChange: function (sels) {
        this.sels = sels;
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中的['+this.sels.length+']个清单？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          this.postRequest('/detailedList/deleteDetailedListByIds',para).then(resp=> {
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
            this.getDetailedList();
          });
        }).catch(() => {

        });
      }
    },
    //页面一进来就立马加载这个方法
    mounted() {
      this.getDetailedList();
    }
  }

</script>

<style scoped>

</style>