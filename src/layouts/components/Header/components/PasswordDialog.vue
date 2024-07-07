<template>
  <el-dialog v-model="dialogVisible" title="修改密码" width="500px" draggable>
    <el-input v-model="password" type="password" placeholder="请输入密码" show-password autocomplete="new-password">
      <template #prefix>
        <el-icon class="el-input__icon">
          <lock />
        </el-icon>
      </template>
    </el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { updatePassword } from "@/api/modules/user";
import md5 from "md5";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
const userStore = useUserStore();

const password = ref("");
const dialogVisible = ref(false);
const openDialog = () => {
  dialogVisible.value = true;
};

const confirm = async () => {
  await updatePassword({
    userId: userStore.userInfo.id,
    password: md5(password.value)
  });
  ElMessage.success("修改成功");
  dialogVisible.value = false;
};

defineExpose({ openDialog });
</script>
