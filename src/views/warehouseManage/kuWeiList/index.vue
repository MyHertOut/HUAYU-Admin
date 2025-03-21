<template>
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
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除库位
        </el-button>
      </template>
      <template #locationStorageHeader="scope">
        <span style="font-size: 16px; font-weight: bolder; color: var(--el-color-primary)"> {{ scope.column.label }}</span>
      </template>
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
      <template #updateTime="scope"> {{ moment(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="openKuCun(scope.row)">查看库存明细</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteFun(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="warehouseManageDetails">
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Depot } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, View } from "@element-plus/icons-vue";
import { getDepotLocation, delDepotLocation } from "@/api/modules/depot";
import { findUserList } from "@/api/modules/user";
import moment from "moment";

const route = useRoute();

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive(route.query?.depotId ? { depotId: Number(route.query?.depotId) } : {});

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
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getDepotLocation"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startDate = newParams.createTime[0]);
  newParams.createTime && (newParams.endDate = newParams.createTime[1]);
  delete newParams.createTime;
  return getDepotLocation(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<Depot.ResDepotList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "locationNo", label: "库位名称", search: { el: "input" } },
  // { prop: "locationDesc", label: "备注" },
  { prop: "depotName", label: "所属仓库", search: { el: "input" } },
  {
    prop: "depotOwner",
    label: "仓库负责人",
    render: scope => {
      return <>{dealName(scope.row.depotOwner)}</>;
    },
    width: 300
  },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "updateTime", label: "更新时间", width: 180 },
  {
    prop: "locationStorage",
    label: "库位存量(件)",
    render: scope => {
      return <span style="color:var(--el-color-primary);font-weight: bolder;font-size: 16px;">{scope.row.locationStorage}</span>;
    },
    fixed: "right",
    width: 140
  },
  { prop: "operation", label: "操作", fixed: "right", width: 220 }
]);

const userList: any = ref([]);
const GetUserList = async () => {
  userList.value = [];
  let res: any = await findUserList();
  if (res.code === "200") {
    userList.value = res.data;
    console.log(userList.value);
  }
};
GetUserList();

const dealName = val => {
  let text = "";
  JSON.parse(val).forEach(id => {
    let item = userList.value.filter(e => e.id == id[0])[0];
    if (item) {
      text += `${item.username}(${item.phoneNum}) `;
    }
  });
  return text;
};

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除库位
const deleteFun = async (params: Depot.ResDepotList) => {
  await useHandleData(delDepotLocation, { ids: [params.id] }, `删除【${params.depotName}】库位`);
  proTable.value?.getTableList();
};

// 批量删除库位
const batchDelete = async (ids: string[]) => {
  await useHandleData(delDepotLocation, { ids }, "删除所选库位");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

const router = useRouter();
const openKuCun = (row: any) => {
  router.push({
    path: "/warehouseManage/kuCunList",
    query: {
      depotLocationId: row.id,
      tabTitle: row.depotName + "-" + row.locationNo
    }
  });
};
</script>
