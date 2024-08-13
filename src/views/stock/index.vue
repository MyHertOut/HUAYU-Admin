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
      <template #tableHeader="">
        <el-button type="primary" :icon="Download" plain @click="downloadFile">导出数据</el-button>
      </template>
      <template #produceDate="scope"> {{ moment(scope.row.produceDate).format("M/D/YYYY") }} </template>
      <template #checkDate="scope"> {{ moment(scope.row.checkDate).format("M/D/YYYY") }} </template>
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
    </ProTable>
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="warehouseManage">
import { ref, reactive } from "vue";
import { Depot } from "@/api/interface";
import { useDownload } from "@/hooks/useDownload";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Download } from "@element-plus/icons-vue";
import { findDepotStorages, exportDepotStorage } from "@/api/modules/depot";
import { findUserList } from "@/api/modules/user";
import moment from "moment";

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

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
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="findDepotStorages"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endTime = newParams.createTime[1]);
  delete newParams.createTime;
  return findDepotStorages(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<Depot.ResDepotList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "depotName", label: "仓库名称", search: { el: "input", key: "name" } },
  { prop: "depotNo", label: "编号" },
  { prop: "depotTypeName", label: "类型" },
  // { prop: "depotAddress", label: "地址" },
  // { prop: "depotArea", label: "区域" },
  {
    prop: "depotOwner",
    label: "负责人",
    render: scope => {
      return <>{dealName(scope.row.depotOwner)}</>;
    },
    width: 300
  },
  { prop: "createTime", label: "创建时间", width: 180 },
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
    text += `${item.username}(${item.phoneNum}) `;
  });
  return text;
};

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

const downloadFile = async () => {
  ElMessageBox.confirm("确认导出数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(exportDepotStorage, "出库记录列表", proTable.value?.searchParam)
  );
};
</script>
