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
        <el-button v-auth="'add'" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增主数据</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除主数据
        </el-button>
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD hh:mm:ss") }} </template>
      <template #updateTime="scope"> {{ moment(scope.row.updateTime).format("YYYY-MM-DD hh:mm:ss") }} </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="materialDicManage">
import { ref, reactive } from "vue";
import { MaterialDic } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getMaterialDicList, addMaterialDic, editMaterialDic, delMaterialDic } from "@/api/modules/materialDic";
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
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getMaterialDicList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endTime = newParams.createTime[1]);
  delete newParams.createTime;
  return getMaterialDicList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<MaterialDic.ResMaterialDicList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "partNo", label: "零件号", search: { el: "input" }, width: 180 },
  { prop: "materialName", label: "零件名称", search: { el: "input" }, width: 180 },
  { prop: "projectName", label: "项目名称", search: { el: "input" }, width: 180 },
  { prop: "reservedAttr1", label: "预留字段1", width: 180 },
  { prop: "reservedAttr2", label: "预留字段2", width: 180 },
  { prop: "reservedAttr3", label: "预留字段3", width: 180 },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "updateTime", label: "更新时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 220 }
]);

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除主数据信息
const deleteAccount = async (params: MaterialDic.ResMaterialDicList) => {
  await useHandleData(delMaterialDic, { ids: [params.id] }, `删除【${params.partNo}】主数据`);
  proTable.value?.getTableList();
};

// 批量删除主数据信息
const batchDelete = async (ids: string[]) => {
  await useHandleData(delMaterialDic, { ids }, "删除所选主数据信息");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const openDrawer = (title: string, row: Partial<MaterialDic.ResMaterialDicList> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    row: { ...row },
    api: title === "新增" ? addMaterialDic : title === "编辑" ? editMaterialDic : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
