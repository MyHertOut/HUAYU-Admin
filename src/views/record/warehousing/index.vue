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
        <el-button type="primary" :icon="Download" plain @click="downloadFile">导出数据</el-button>
        <el-button
          type="danger"
          v-if="false"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
      </template>
      <template #materialNumHeader="scope">
        <span style="font-size: 16px; font-weight: bolder; color: var(--el-color-primary)"> {{ scope.column.label }}</span>
      </template>
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteFun(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="warehousing">
import { ref, reactive } from "vue";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, View, Download } from "@element-plus/icons-vue";
import { getDepotRecordList, delDepotRecord, exportDepotRecord } from "@/api/modules/depotRecord";
import moment from "moment";
import { findMaterialDictionaryList } from "@/api/modules/materialDic";

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ operateType: 1 });

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
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getDepotRecordList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startDate = newParams.createTime[0]);
  newParams.createTime && (newParams.endDate = newParams.createTime[1]);
  delete newParams.createTime;
  return getDepotRecordList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
const materialDicList: any = ref([]);
const GetMaterialDicList = async () => {
  materialDicList.value = [];
  let res: any = await findMaterialDictionaryList();
  if (res.code === "200") {
    materialDicList.value = res.data;
  }
};
GetMaterialDicList();

// 表格配置项
// sourceDepotId/targetDepotId/materialId/qrBatchNo/qrSerialNo/operateType/materialIds/depotOwner/partNo/operatorId/depotName/depotId/materialName/materialProject/materialBelongTo
const columns = reactive<ColumnProps<any>[]>([
  // { type: "selection", fixed: "left", width: 70 },
  {
    prop: "partNo",
    label: "件号",
    enum: materialDicList,
    search: { el: "select", props: { filterable: true, filterMethod: true } },
    fieldNames: { label: "partNo", value: "partNo" },
    width: 120
  },
  { prop: "qrSerialNo", label: "编号" },
  { prop: "materialName", label: "零件名称", search: { el: "input" }, width: 120 },
  { prop: "materialProject", label: "项目名称", width: 120 },
  { prop: "batchNo", label: "批次", width: 120 },
  {
    prop: "materialNum",
    label: "数量",
    render: scope => {
      return <span style="color:var(--el-color-primary);font-weight: bolder;font-size: 16px;">{scope.row.materialNum}</span>;
    },
    width: 120
  },
  { prop: "targetDepotName", label: "入库仓库", search: { el: "input" }, width: 120 },
  { prop: "targetLocationNo", label: "入库库位" },
  {
    prop: "createTime",
    label: "入库时间",
    width: 180,
    search: {
      el: "date-picker",
      span: 2,
      props: { type: "daterange", valueFormat: "YYYY-MM-DD" },
      defaultValue: []
    }
  },
  { prop: "operatorName", label: "入库人", width: 180 },
  { prop: "targetLocationDescribe", label: "备注", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 220 }
]);

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

const downloadFile = async () => {
  ElMessageBox.confirm("确认导出数据?", "温馨提示", { type: "warning" }).then(() => {
    let startDate: any = "";
    let endDate: any = "";
    if (proTable.value?.searchParam.createTime.length) {
      startDate = proTable.value?.searchParam.createTime[0];
      endDate = proTable.value?.searchParam.createTime[1];
      useDownload(exportDepotRecord, "入库记录列表", {
        operateType: 1,
        startDate: startDate,
        endDate: endDate,
        ...proTable.value?.searchParam
      });
    } else {
      useDownload(exportDepotRecord, "入库记录列表", { operateType: 1, ...proTable.value?.searchParam });
    }
  });
};

// 删除记录
const deleteFun = async (params: any) => {
  await useHandleData(delDepotRecord, { ids: [params.id] }, `删除【${params.qrSerialNo}】记录`);
  proTable.value?.getTableList();
};

// 批量删除记录
const batchDelete = async (ids: string[]) => {
  await useHandleData(delDepotRecord, { ids }, "删除所选记录");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const openDrawer = (title: string, row: any = {}) => {
  const params = {
    title,
    isView: title === "查看",
    row: { ...row },
    api: undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
