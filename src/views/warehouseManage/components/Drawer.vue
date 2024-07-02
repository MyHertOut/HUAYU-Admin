<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}仓库`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="名称" prop="depotName">
        <el-input v-model="drawerProps.row!.depotName" placeholder="请输入仓库名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="编号" prop="depotNo">
        <el-input v-model="drawerProps.row!.depotNo" placeholder="请输入仓库编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="depotTypeName">
        <el-input v-model="drawerProps.row!.depotTypeName" placeholder="请输入仓库类型" clearable></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="depotAddress">
        <el-input v-model="drawerProps.row!.depotAddress" placeholder="请输入仓库地址" clearable></el-input>
      </el-form-item>
      <el-form-item label="区域" prop="depotArea">
        <el-input v-model="drawerProps.row!.depotArea" placeholder="请输入仓库区域" clearable></el-input>
      </el-form-item>
      <el-form-item label="负责人" prop="depotOwner">
        <el-select
          v-model="drawerProps.row!.depotOwner"
          filterable
          default-first-option
          placeholder="请输入仓库负责人"
          clearable
          multiple
        >
          <el-option
            v-for="(item, key) in drawerProps.userList"
            :key="key"
            :label="`${item.username}(${item.phoneNum})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
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
import { Depot } from "@/api/interface";

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
  userList?: any;
  row: Partial<Depot.ResDepotList>;
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
  if (drawerProps.value.title !== "新增") {
    drawerProps.value.row.depotOwner = JSON.parse(drawerProps.value.row.depotOwner);
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
      ElMessage.success({ message: `${drawerProps.value.title}仓库成功！` });
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
