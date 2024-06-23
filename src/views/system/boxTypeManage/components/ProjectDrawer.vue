<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}用户`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="用户头像" prop="userHeaderIcon">
        <UploadImg v-model:image-url="drawerProps.row!.userHeaderIcon" width="135px" height="135px" :file-size="3">
          <template #empty>
            <el-icon><Avatar /></el-icon>
            <span>请上传头像</span>
          </template>
          <template #tip> 头像大小不能超过 3M </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="用户姓名" prop="username">
        <el-input v-model="drawerProps.row!.username" placeholder="请填写用户姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="drawerProps.row!.phone" placeholder="请填写用户手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="所属部门" prop="department">
        <el-input v-model="drawerProps.row!.department" placeholder="请填写用户所属部门" clearable></el-input>
      </el-form-item>
      <el-form-item label="职位" prop="position">
        <el-input v-model="drawerProps.row!.position" placeholder="请填写用户职位" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-input v-model="drawerProps.row!.userType" placeholder="请填写用户类型" clearable></el-input>
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
import { User } from "@/api/interface";
import UploadImg from "@/components/Upload/Img.vue";

const rules = reactive({
  userHeaderIcon: [{ required: true, message: "请上传用户头像" }],
  username: [{ required: true, message: "请填写用户姓名" }],
  phone: [{ required: true, message: "请填写用户手机号" }],
  department: [{ required: true, message: "请填写用户所属部门" }],
  position: [{ required: true, message: "请填写用户职位" }],
  userType: [{ required: true, message: "请填写用户类型" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<User.ResUserList>;
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
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}用户成功！` });
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
