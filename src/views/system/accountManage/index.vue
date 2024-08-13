<template>
  <div class="table-box">
    <div class="main-box">
      <RoleFilter
        label="roleName"
        title="角色列表"
        :data="roleList"
        :default-value="initParam.roleId"
        @change="changeTreeFilter"
      />
      <div class="table-box">
        <ProTable
          ref="proTable"
          :columns="columns"
          :request-api="getTableList"
          :init-param="initParam"
          :data-callback="dataCallback"
          @darg-sort="sortTable"
        >
          <!-- 表格 header 按钮 -->
          <template #tableHeader="scope">
            <el-button v-auth="'add'" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增用户</el-button>
            <el-button
              type="danger"
              :icon="Delete"
              plain
              :disabled="!scope.isSelected"
              @click="batchDelete(scope.selectedListIds)"
            >
              批量删除用户
            </el-button>
          </template>
          <!-- Expand -->
          <template #expand="scope">
            {{ scope.row }}
          </template>
          <!-- createTime -->
          <template #createTime="scope">{{ moment(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
          <template #updateTime="scope">{{ moment(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
          <!-- 表格操作 -->
          <template #operation="scope">
            <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
            <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
            <el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">重置密码</el-button>
            <el-button type="primary" link :icon="Delete" @click="deleteFun(scope.row)">删除</el-button>
          </template>
        </ProTable>
        <Drawer ref="drawerRef" />
        <ImportExcel ref="dialogRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx" name="accountManage">
import { ref, reactive } from "vue";
import { User } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import RoleFilter from "@/components/RoleFilter/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View, Refresh } from "@element-plus/icons-vue";
import { getUserList, delUser, editUser, addUser, updatePassword } from "@/api/modules/user";
import { findRoleList } from "@/api/modules/role";
import moment from "moment";
import md5 from "md5";

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ roleId: 0 });

// 树形筛选切换
const changeTreeFilter = (val: any) => {
  proTable.value!.pageable.pageNo = 1;
  initParam.roleId = val;
};
// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNo && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  return {
    list: data.items,
    total: data.totalRows,
    pageNo: data.pageNo,
    pageSize: data.pageSize
  };
};

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getUserList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startDate = newParams.createTime[0]);
  newParams.createTime && (newParams.endDate = newParams.createTime[1]);
  delete newParams.createTime;
  return getUserList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<User.ResUserList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  // { type: "sort", label: "Sort", width: 80 },
  // { type: "expand", label: "Expand", width: 85 },
  { prop: "username", label: "用户姓名", search: { el: "input" }, width: 120, fixed: "left" },
  { prop: "loginName", label: "登录名", width: 120 },
  { prop: "phoneNum", label: "手机号", width: 130 },
  { prop: "department", label: "所属部门", width: 130 },
  { prop: "position", label: "职位", width: 130 },
  {
    prop: "roles",
    label: "用户角色",
    width: 300,
    render: scope => {
      return (
        <>
          {scope.row.roles.map((e: any) => {
            return <el-tag style="margin-right:4px;">{e.roleName}</el-tag>;
          })}
        </>
      );
    }
  },
  {
    prop: "userStatus",
    label: "用户状态",
    render: scope => {
      return (
        <>{<el-tag type={!scope.row.userStatus ? "success" : "danger"}>{!scope.row.userStatus ? "启用" : "停用"}</el-tag>}</>
      );
    },
    width: 100
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180
  },
  {
    prop: "updateTime",
    label: "更新时间",
    width: 180
  },
  { prop: "operation", label: "操作", fixed: "right", width: 320 }
]);

const roleList: any = ref([]);
const GetRoleList = async () => {
  roleList.value = [];
  let res: any = await findRoleList();
  if (res.code === "200") {
    roleList.value = res.data;
    roleList.value.forEach((e: any) => {
      e.value = JSON.stringify({
        roleId: e.id,
        roleType: e.roleType,
        roleTypeName: e.roleType === 1 ? "普通角色" : "超级角色",
        roleName: e.roleName
      });
    });
    console.log(roleList.value);
  }
};
GetRoleList();

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除用户信息
const deleteFun = async (params: User.ResUserList) => {
  await useHandleData(delUser, { ids: [params.id] }, `删除【${params.username}】用户`);
  proTable.value?.getTableList();
};

// 批量删除用户信息
const batchDelete = async (ids: string[]) => {
  await useHandleData(delUser, { ids }, "删除所选用户信息");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

const resetPass = async (params: any) => {
  await useHandleData(updatePassword, { userId: params.id, password: md5("123456") }, `重置【${params.username}】用户密码`);
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const openDrawer = (title: string, row: Partial<User.ResUserList> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    roleList: roleList.value,
    row: { ...row },
    api: title === "新增" ? addUser : title === "编辑" ? editUser : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
