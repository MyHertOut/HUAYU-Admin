<template>
  <div class="table-box" v-loading="printLoading" element-loading-text="生成中，请耐心等待...">
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
        <el-button v-auth="'add'" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增标识卡</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除标识卡
        </el-button>
      </template>
      <template #produceDate="scope"> {{ moment(scope.row.produceDate).format("M/D/YYYY") }} </template>
      <template #checkDate="scope"> {{ moment(scope.row.checkDate).format("M/D/YYYY") }} </template>
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD hh:mm:ss") }} </template>
      <template #updateTime="scope"> {{ moment(scope.row.updateTime).format("YYYY-MM-DD hh:mm:ss") }} </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-popover :visible="scope.row.visible" placement="top" :width="195">
          <div>
            <el-input v-model="scope.row.printNum" style="width: 170px" placeholder="请输入需要打印的数量" />
            <div style="margin: 15px 0 0; text-align: right">
              <el-button size="small" text @click="(scope.row.visible = false), (scope.row.printNum = '')">取消</el-button>
              <el-button size="small" type="primary" @click="printPreFun(scope.row)"> 确定 </el-button>
            </div>
          </div>
          <template #reference>
            <el-button type="primary" link :icon="Printer" @click="scope.row.visible = true">打印</el-button>
          </template>
        </el-popover>
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteAccount(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import { Project } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View, Printer } from "@element-plus/icons-vue";
import { getProjectList, addProject, editProject, delProject } from "@/api/modules/project";
import { findMaterialDictionaryList } from "@/api/modules/materialDic";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNo && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  data.items.forEach((e: any) => {
    e.visible = false;
    e.printNum = "";
  });
  return {
    list: data.items,
    total: data.totalRows,
    pageNo: data.pageNo,
    pageSize: data.pageSize
  };
};

// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
// 默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getProjectList"
const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.createTime && (newParams.startTime = newParams.createTime[0]);
  newParams.createTime && (newParams.endTime = newParams.createTime[1]);
  delete newParams.createTime;
  return getProjectList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<Project.ResProjectList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "partNo", label: "件号", search: { el: "input" }, width: 180 },
  { prop: "materialName", label: "零件名称", search: { el: "input" }, width: 180 },
  { prop: "materialProject", label: "项目名称", width: 180 },
  { prop: "produceDate", label: "生产日期", width: 100 },
  { prop: "batchNo", label: "批次" },
  { prop: "materialNum", label: "数量" },
  { prop: "shift", label: "班次" },
  { prop: "checker", label: "检验员" },
  { prop: "checkDate", label: "检验日期", width: 100 },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "updateTime", label: "更新时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 280 }
]);

const materialDicList: any = ref([]);
const GetMaterialDicList = async () => {
  materialDicList.value = [];
  let res: any = await findMaterialDictionaryList();
  if (res.code === "200") {
    materialDicList.value = res.data;
  }
};
GetMaterialDicList();

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除标识卡信息
const deleteAccount = async (params: Project.ResProjectList) => {
  await useHandleData(delProject, { ids: [params.id] }, `删除【${params.materialName}】标识卡`);
  proTable.value?.getTableList();
};

// 批量删除标识卡
const batchDelete = async (ids: string[]) => {
  await useHandleData(delProject, { ids }, "删除所选标识卡");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const openDrawer = (title: string, row: Partial<Project.ResProjectList> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    materialDicList: materialDicList.value,
    row: { ...row },
    api: title === "新增" ? addProject : title === "编辑" ? editProject : undefined,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

let printLoading: any = ref(false);

const printPreFun = (row: any) => {
  if (!row.printNum) {
    return;
  }
  row.visible = false;
  printLoading.value = true;
  setTimeout(() => {
    printFun(row);
  }, 1000);
};
// 打印
const printFun = async (row: any) => {
  // 创建一个新的工作簿
  const workbook: any = new ExcelJS.Workbook();
  const worksheet: any = workbook.addWorksheet("Material Label");

  const globalFontStyle = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 14 };

  const borderStyle = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" }
  };
  let printDate = moment(new Date()).format("YYYYMMDDHHMMSS");
  for (let i = 0; i < row.printNum; i++) {
    // 设置列宽和行高
    worksheet.getColumn(1).width = 19.5;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getRow(8 * i + 1).height = 162;
    worksheet.getRow(8 * i + 2).height = 80;
    worksheet.getRow(8 * i + 3).height = 80;
    worksheet.getRow(8 * i + 4).height = 80;
    worksheet.getRow(8 * i + 5).height = 80;
    worksheet.getRow(8 * i + 6).height = 80;
    worksheet.getRow(8 * i + 7).height = 40;

    worksheet.getRow(8 * i + 1).font = globalFontStyle;
    worksheet.getRow(8 * i + 2).font = globalFontStyle;
    worksheet.getRow(8 * i + 3).font = globalFontStyle;
    worksheet.getRow(8 * i + 4).font = globalFontStyle;
    worksheet.getRow(8 * i + 5).font = globalFontStyle;
    worksheet.getRow(8 * i + 6).font = globalFontStyle;
    worksheet.getRow(8 * i + 7).font = globalFontStyle;

    let printNo = `${printDate}-${i + 1}`;
    let QRCodeUrl = `https://47.109.87.12/scanCode?id=${row.id}&no=${printNo}`;
    let base64Image = await QRCode.toDataURL(QRCodeUrl); // 替换为你的 base64 图片数据（不包括前缀 data:image/png;base64,）
    base64Image = base64Image.replace("data:image/png;base64,", "");
    const imageArrayBuffer = base64ToUint8Array(base64Image);
    // 插入图片
    const imageId = workbook.addImage({
      buffer: imageArrayBuffer,
      extension: "png"
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 8 * i }, // top-left position of the image
      ext: { width: 140, height: 140 }, // size of the image
      editAs: "oneCell"
    });
    worksheet.getCell(`A${8 * i + 1}`).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`A${8 * i + 1}`).border = borderStyle;

    let startRow = 8 * i + 1;
    let startCol = 2;
    // let numRows = 3;
    let numCols = 2;

    let startCell = worksheet.getCell(startRow, startCol);
    let endRow = startRow;
    let endCol = startCol + numCols;
    let endCell = worksheet.getCell(endRow, endCol);
    // console.log(endCell, "endCell");
    let mergeRange = `${startCell.address}:${endCell.address}`;
    // console.log(mergeRange, "mergeRange");
    // 合并单元格并插入文本
    worksheet.mergeCells(mergeRange);
    worksheet.getCell(mergeRange).value = "产品状态标识卡\nMaterial Label";
    worksheet.getCell(mergeRange).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center"
    };
    worksheet.getCell(mergeRange).font = globalFontStyle;
    worksheet.getCell(mergeRange).border = borderStyle;

    worksheet.getCell(`${startRow + 1}`, 1).value = "项目名称\nProject";
    worksheet.getCell(`${startRow + 1}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 1}`, 2).value = "VOLVO K423";
    worksheet.getCell(`${startRow + 1}`, 2).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 1}`, 3).value = "零件名称\nDescription";
    worksheet.getCell(`${startRow + 1}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 1}`, 4).value = "消音棉";
    worksheet.getCell(`${startRow + 1}`, 4).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 2}`, 1).value = "件号\nPart Number";
    worksheet.getCell(`${startRow + 2}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 2}`, 2).value = "82602067 GF";
    worksheet.getCell(`${startRow + 2}`, 2).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 2}`, 3).value = "生产日期\nMFD.";
    worksheet.getCell(`${startRow + 2}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 2}`, 4).value = "6/29/2024";
    worksheet.getCell(`${startRow + 2}`, 4).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 1).value = "批次\nBatch NO.";
    worksheet.getCell(`${startRow + 3}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 2).value = "98";
    worksheet.getCell(`${startRow + 3}`, 2).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 3).value = "数量\nQuantity";
    worksheet.getCell(`${startRow + 3}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 4).value = "51";
    worksheet.getCell(`${startRow + 3}`, 4).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 4}`, 1).value = "班次\nShift";
    worksheet.getCell(`${startRow + 4}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 4}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 4}`, 2).value = "B";
    worksheet.getCell(`${startRow + 4}`, 2).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 4}`, 2).border = borderStyle;

    let insDateRange = worksheet.getCell(`${startRow + 4}`, 3).address + ":" + worksheet.getCell(`${startRow + 5}`, 3).address;
    worksheet.mergeCells(insDateRange);
    worksheet.getCell(insDateRange).value = "检验日期\nInspection Date";
    worksheet.getCell(insDateRange).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(insDateRange).border = borderStyle;

    let insDateValRange = worksheet.getCell(`${startRow + 4}`, 4).address + ":" + worksheet.getCell(`${startRow + 5}`, 4).address;
    worksheet.mergeCells(insDateValRange);
    worksheet.getCell(insDateValRange).value = "6/29/2024";
    worksheet.getCell(insDateValRange).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(insDateValRange).border = borderStyle;

    worksheet.getCell(`${startRow + 5}`, 1).value = "检验员\nInspector";
    worksheet.getCell(`${startRow + 5}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 5}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 5}`, 2).value = "叶维政";
    worksheet.getCell(`${startRow + 5}`, 2).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 5}`, 2).border = borderStyle;

    let endDateNoRange = worksheet.getCell(`${startRow + 6}`, 1).address + ":" + worksheet.getCell(`${startRow + 6}`, 4).address;
    worksheet.mergeCells(endDateNoRange);
    worksheet.getCell(endDateNoRange).value = `${printDate}-${i + 1}`;
    worksheet.getCell(endDateNoRange).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(endDateNoRange).border = borderStyle;

    let endMergeRange = worksheet.getCell(`${startRow + 7}`, 1).address + ":" + worksheet.getCell(`${startRow + 7}`, 4).address;
    worksheet.mergeCells(endMergeRange);
  }

  // 导出 Excel 文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, "output.xlsx");
  printLoading.value = false;
  row.printNum = "";
};
</script>
