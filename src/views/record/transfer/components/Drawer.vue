<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="50%" :title="`${drawerProps.title}记录`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
      class="onlyRead"
    >
      <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #efefef">
        <div style="margin-bottom: 15px">零件信息</div>
        <el-form-item label="编号" prop="qrSerialNo">
          <el-input v-model="drawerProps.row!.qrSerialNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="件号" prop="partNo">
          <el-input v-model="drawerProps.row!.partNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="项目名称" prop="materialProject">
          <el-input v-model="drawerProps.row!.materialProject" clearable></el-input>
        </el-form-item>
        <el-form-item label="生产日期" prop="produceDate">
          <el-input v-model="drawerProps.row!.produceDate" clearable></el-input>
        </el-form-item>
        <el-form-item label="批次" prop="batchNo">
          <el-input v-model="drawerProps.row!.batchNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="materialNum">
          <el-input v-model="drawerProps.row!.materialNum" clearable></el-input>
        </el-form-item>
        <el-form-item label="班次" prop="shift">
          <el-input v-model="drawerProps.row!.shift" clearable></el-input>
        </el-form-item>
        <el-form-item label="检验员" prop="checker">
          <el-input v-model="drawerProps.row!.checker" clearable></el-input>
        </el-form-item>
        <el-form-item label="检验日期" prop="checkDate">
          <el-input v-model="drawerProps.row!.checkDate" clearable></el-input>
        </el-form-item>
        <el-form-item label="追溯码" prop="traceCode">
          <el-input v-model="drawerProps.row!.traceCode" clearable></el-input>
        </el-form-item>
      </div>

      <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #efefef">
        <div style="margin-bottom: 15px">来源仓库</div>
        <el-form-item label="仓库名称" prop="sourceDepotName">
          <el-input v-model="drawerProps.row!.sourceDepotName" clearable></el-input>
        </el-form-item>
        <el-form-item label="库位" prop="sourceLocationNo">
          <el-input v-model="drawerProps.row!.sourceLocationNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="库位描述" prop="sourceLocationDescribe">
          <el-input v-model="drawerProps.row!.sourceLocationDescribe" clearable></el-input>
        </el-form-item>
      </div>

      <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #efefef">
        <div style="margin-bottom: 15px">目标仓库</div>
        <el-form-item label="仓库名称" prop="targetDepotName">
          <el-input v-model="drawerProps.row!.targetDepotName" clearable></el-input>
        </el-form-item>
        <el-form-item label="库位" prop="targetLocationNo">
          <el-input v-model="drawerProps.row!.targetLocationNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="库位描述" prop="targetLocationDescribe">
          <el-input v-model="drawerProps.row!.targetLocationDescribe" clearable></el-input>
        </el-form-item>
      </div>

      <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #efefef">
        <div style="margin-bottom: 15px">操作信息</div>
        <el-form-item label="操作人" prop="operatorName">
          <el-input v-model="drawerProps.row!.operatorName" clearable></el-input>
        </el-form-item>
        <el-form-item label="入库时间" prop="createTime">
          <el-input v-model="drawerProps.row!.createTime" clearable></el-input>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

const rules = reactive({
  depotName: [{ required: true, message: "请输入仓库名称" }],
  depotNo: [{ required: true, message: "请输入仓库编号" }],
  depotTypeName: [{ required: true, message: "请输入仓库类型" }],
  depotAddress: [{ required: true, message: "请输入仓库地址" }],
  depotArea: [{ required: true, message: "请输入仓库区域" }],
  depotOwner: [{ required: true, message: "请输入仓库负责人" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<any>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
  if (drawerProps.value.title === "查看") {
    console.log(1);
    for (let k in drawerProps.value.row) {
      if (!drawerProps.value.row[k]) {
        drawerProps.value.row[k] = "--";
      } else {
        if (k === "produceDate" || k === "checkDate") {
          drawerProps.value.row[k] = moment(drawerProps.value.row[k]).format("M/D/YYYY");
        }
        if (k === "createTime") {
          drawerProps.value.row[k] = moment(drawerProps.value.row[k]).format("YYYY-MM-DD HH:mm:ss");
        }
      }
    }
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      drawerProps.value.row.depotOwner = JSON.stringify(drawerProps.value.row.depotOwner);
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}记录成功！` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style lang="scss">
.onlyRead {
  .el-form-item--default {
    margin-bottom: 0;
  }
}
</style>
