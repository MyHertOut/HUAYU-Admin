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
      <el-form-item label="用户头像" prop="headerImage">
        <UploadImg v-model:image-url="drawerProps.row!.headerImage" width="135px" height="135px" :file-size="3">
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
      <el-form-item label="登录名" prop="loginName">
        <el-input v-model="drawerProps.row!.loginName" placeholder="请填写登录名" clearable></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNum">
        <el-input v-model="drawerProps.row!.phoneNum" placeholder="请填写用户手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="所属部门" prop="department">
        <el-input v-model="drawerProps.row!.department" placeholder="请填写用户所属部门" clearable></el-input>
      </el-form-item>
      <el-form-item label="职位" prop="position">
        <el-input v-model="drawerProps.row!.position" placeholder="请填写用户职位" clearable></el-input>
      </el-form-item>
      <el-form-item label="用户角色" prop="roles">
        <el-select
          v-model="drawerProps.row!.roles"
          filterable
          default-first-option
          placeholder="请选择用户角色"
          clearable
          multiple
        >
          <el-option v-for="item in drawerProps.roleList" :key="item.id" :label="item.roleName" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户状态" prop="userStatus">
        <el-radio-group v-model="drawerProps.row!.userStatus">
          <el-radio :value="0" size="large">启用</el-radio>
          <el-radio :value="1" size="large">停用</el-radio>
        </el-radio-group>
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
import md5 from "md5";

const rules = reactive({
  headerImage: [{ required: true, message: "请上传用户头像" }],
  username: [{ required: true, message: "请填写用户姓名" }],
  loginName: [{ required: true, message: "请填写登录名" }],
  phoneNum: [{ required: true, message: "请填写用户手机号" }],
  department: [{ required: true, message: "请填写用户所属部门" }],
  position: [{ required: true, message: "请填写用户职位" }],
  roles: [{ required: true, message: "请选择用户角色" }],
  userStatus: [{ required: true, message: "请选择用户状态" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  roleList?: any;
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
  if (drawerProps.value.title === "新增") {
    drawerProps.value.row.userStatus = 0;
  } else {
    let rolesArr: any = JSON.parse(JSON.stringify(drawerProps.value.row.roles));
    let arr: any = [];
    rolesArr.forEach((el: any) => {
      arr.push(JSON.stringify(el));
    });
    drawerProps.value.row.roles = arr;
    console.log(drawerProps.value.row.roles);
  }
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      let rolesArr: any = JSON.parse(JSON.stringify(drawerProps.value.row.roles));
      let arr: any = [];
      rolesArr.forEach((el: any) => {
        arr.push(JSON.parse(el));
      });
      drawerProps.value.row.roles = arr;
      if (drawerProps.value.title === "新增") {
        drawerProps.value.row.password = md5(drawerProps.value.row.phoneNum);
      }
      delete drawerProps.value.row.createTime;
      delete drawerProps.value.row.updateTime;
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
