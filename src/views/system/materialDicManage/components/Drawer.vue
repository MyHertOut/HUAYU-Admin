<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}主数据`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="零件号" prop="partNo">
        <el-input v-model="drawerProps.row!.partNo" placeholder="请填写零件号" clearable></el-input>
      </el-form-item>
      <el-form-item label="零件名称" prop="materialName">
        <el-input v-model="drawerProps.row!.materialName" placeholder="请填写零件名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="drawerProps.row!.projectName" placeholder="请填写项目名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="规格型号" prop="reservedAttr1">
        <el-input v-model="drawerProps.row!.reservedAttr1" placeholder="请填写规格型号" clearable></el-input>
      </el-form-item>
      <el-form-item label="U8存货编码" prop="reservedAttr2">
        <el-input v-model="drawerProps.row!.reservedAttr2" placeholder="请填写U8存货编码" clearable></el-input>
      </el-form-item>
      <el-form-item v-if="false" label="预留字段3" prop="reservedAttr3">
        <el-input v-model="drawerProps.row!.reservedAttr3" placeholder="请填写预留字段3" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="Drawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { MaterialDic } from "@/api/interface";

const rules = reactive({
  partNo: [{ required: true, message: "请填写零件号" }],
  materialName: [{ required: true, message: "请填写零件名称" }],
  projectName: [{ required: true, message: "请填写项目名称" }]
  // reservedAttr1: [{ required: true, message: "请填写预留字段1" }],
  // reservedAttr2: [{ required: true, message: "请填写预留字段2" }],
  // reservedAttr3: [{ required: true, message: "请填写预留字段3" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<MaterialDic.ResMaterialDicList>;
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
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      delete drawerProps.value.row.createTime;
      delete drawerProps.value.row.updateTime;
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}主数据成功！` });
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
