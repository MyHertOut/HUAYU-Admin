<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}角色`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="名称" prop="roleName">
        <el-input v-model="drawerProps.row!.roleName" placeholder="请输入角色名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="roleStatus">
        <el-radio-group v-model="drawerProps.row!.roleStatus">
          <el-radio :value="1" size="large">正常</el-radio>
          <el-radio :value="0" size="large">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="菜单权限" prop="menuIds">
        <el-cascader style="width: 100%" v-model="drawerProps.row!.menuIds" :options="menuList" :props="props" clearable />
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
import { Role } from "@/api/interface";
import authMenuList from "@/assets/json/authMenuList.json";

const rules = reactive({
  roleName: [{ required: true, message: "请输入角色名称" }],
  roleStatus: [{ required: true, message: "请输入角色编号" }],
  menuIds: [{ required: true, message: "请输入角色类型" }]
});

const menuList = authMenuList.data;
console.log(menuList);
const props = {
  value: "id",
  label: "title",
  children: "children",
  multiple: true
};

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<Role.ResRoleList>;
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
  if (drawerProps.value.title === "新增") {
    drawerProps.value.row.roleStatus = 1;
  } else {
    drawerProps.value.row.menuIds = JSON.parse(drawerProps.value.row.menuIds);
  }
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      drawerProps.value.row.menuIds = JSON.stringify(drawerProps.value.row.menuIds);
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}角色成功！` });
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
