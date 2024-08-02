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
        <el-button v-auth="'batchAdd'" type="primary" :icon="Upload" plain @click="batchAdd">批量添加</el-button>
        <el-button v-auth="'export'" type="primary" :icon="Download" plain @click="downloadFile">导出数据</el-button>
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
            <el-input v-model.number="printNum" style="width: 170px" placeholder="请输入需要打印的数量" />
            <div style="margin: 15px 0 0; text-align: right">
              <el-button size="small" text @click="(scope.row.visible = false), (printNum = '')">取消</el-button>
              <el-button size="small" type="primary" @click="printPreFun(scope.row)"> 确定 </el-button>
            </div>
          </div>
          <template #reference>
            <el-button type="primary" v-if="!scope.row.qrBatchQty" link :icon="Printer" @click="scope.row.visible = true">
              打印
            </el-button>
          </template>
        </el-popover>
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('复制', scope.row)">复制</el-button>
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
        <el-button type="primary" link :icon="Delete" @click="deleteFun(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup lang="tsx" name="projectManage">
import { ref, reactive } from "vue";
import { Project } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View, Printer, Upload, Download } from "@element-plus/icons-vue";
import {
  getProjectList,
  addProject,
  editProject,
  delProject,
  exportExcelTemplate,
  exportExcel,
  importExcel
} from "@/api/modules/project";
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

const materialDicList: any = ref([]);
const GetMaterialDicList = async () => {
  materialDicList.value = [];
  let res: any = await findMaterialDictionaryList();
  if (res.code === "200") {
    materialDicList.value = res.data;
  }
};
GetMaterialDicList();

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<Project.ResProjectList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "partNo",
    label: "件号",
    enum: materialDicList,
    search: { el: "select", props: { filterable: true } },
    fieldNames: { label: "partNo", value: "partNo" },
    width: 180
  },
  { prop: "materialName", label: "零件名称", search: { el: "input" }, width: 180 },
  { prop: "materialProject", label: "项目名称", width: 180 },
  { prop: "produceDate", label: "生产日期", width: 100 },
  { prop: "batchNo", label: "批次" },
  { prop: "materialNum", label: "数量" },
  { prop: "shift", label: "班次" },
  { prop: "checker", label: "检验员" },
  { prop: "qrBatchQty", label: "打印数量", width: 100 },
  { prop: "checkDate", label: "检验日期", width: 100 },
  { prop: "createTime", label: "创建时间", width: 180 },
  { prop: "updateTime", label: "更新时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 280 }
]);

// 表格拖拽排序
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};

// 删除标识卡信息
const deleteFun = async (params: Project.ResProjectList) => {
  await useHandleData(delProject, { ids: [params.id] }, `删除【${params.materialName}】标识卡`);
  proTable.value?.getTableList();
};

// 批量删除标识卡
const batchDelete = async (ids: string[]) => {
  await useHandleData(delProject, { ids }, "删除所选标识卡");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出标识卡数据?", "温馨提示", { type: "warning" }).then(() =>
    useDownload(exportExcel, "标识卡列表", proTable.value?.searchParam)
  );
};

// 批量添加用户
const dialogRef = ref<InstanceType<typeof ImportExcel> | null>(null);
const batchAdd = () => {
  const params = {
    title: "标识卡",
    tempApi: exportExcelTemplate,
    importApi: importExcel,
    getTableList: proTable.value?.getTableList
  };
  dialogRef.value?.acceptParams(params);
};

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const openDrawer = (title: string, row: Partial<Project.ResProjectList> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    materialDicList: materialDicList.value,
    row: { ...row },
    api: title === "新增" || title === "复制" ? addProject : title === "编辑" ? editProject : undefined,
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
let printNum: any = ref();
const printPreFun = async (row: any) => {
  if (!printNum.value) {
    return;
  }
  row.visible = false;
  printLoading.value = true;
  row.qrBatchQty = printNum.value;
  await editProject(row);
  setTimeout(() => {
    printFun(row);
  }, 1000);
};
// 打印
const printFun = async (row: any) => {
  // 创建一个新的工作簿
  const workbook: any = new ExcelJS.Workbook();
  const worksheet: any = workbook.addWorksheet("Material Label");

  const globalFontStyle = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 16 };

  const borderStyle = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" }
  };
  let printDate = moment(new Date()).format("YYYYMMDDHHMMSS");
  for (let i = 0; i < row.qrBatchQty; i++) {
    // 设置列宽和行高
    worksheet.getColumn(1).width = 18.69;
    worksheet.getColumn(2).width = 28;
    worksheet.getColumn(3).width = 28;
    worksheet.getColumn(4).width = 28;
    worksheet.getRow(8 * i + 1).height = 140;
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
    let QRCodeUrl = `${row.id}|${printNo}`;
    let base64ImageLogo =
      "data:image/png;base64,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EJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEJGRmRRCCCGEEBEx5v8HrSKaRHRNiBoAAAAASUVORK5CYII=";
    base64ImageLogo = base64ImageLogo.replace("data:image/png;base64,", "");
    const imageArrayBufferLogo = base64ToUint8Array(base64ImageLogo);
    // 插入图片
    const imageIdLogo = workbook.addImage({
      buffer: imageArrayBufferLogo,
      extension: "png"
    });
    let offsetX = (18.69 * 7.5 - 120) / 2;
    let offsetY = (140 * 0.75 - 120) / 2;
    worksheet.addImage(imageIdLogo, {
      tl: { col: 0, row: 8 * i, offsetX: offsetX, offsetY: offsetY }, // top-left position of the image
      br: { col: 1, row: 8 * i + 1, offsetX: -offsetX, offsetY: -offsetY }, // 图片的右下角位置，相对于起始位置的偏移
      ext: { width: 120, height: 120 }, // size of the image
      editAs: "oneCell"
      // offsets: {
      //   x: (18.69 * 7.5 - 100) / 2, // 图片水平偏移
      //   y: (140 * 0.75 - 100) / 2 // 图片垂直偏移
      // }
    });
    worksheet.getCell(`A${8 * i + 1}`).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`A${8 * i + 1}`).border = borderStyle;

    let startRow = 8 * i + 1;
    let startCol = 2;
    // let numRows = 3;
    let numCols = 1;

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
    worksheet.getCell(mergeRange).font = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 20 };
    worksheet.getCell(mergeRange).border = borderStyle;

    let base64Image = await QRCode.toDataURL(QRCodeUrl); // 替换为你的 base64 图片数据（不包括前缀 data:image/png;base64,）
    base64Image = base64Image.replace("data:image/png;base64,", "");
    const imageArrayBuffer = base64ToUint8Array(base64Image);
    // 插入图片
    const imageId = workbook.addImage({
      buffer: imageArrayBuffer,
      extension: "png"
    });
    worksheet.addImage(imageId, {
      tl: { col: 3, row: 8 * i }, // top-left position of the image
      br: { col: 4, row: 8 * i + 1 }, // 图片的右下角位置，相对于起始位置的偏移
      extension: { width: 120, height: 120 }, // size of the image
      editAs: "oneCell"
    });
    worksheet.getCell(`D${8 * i + 1}`).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`D${8 * i + 1}`).border = borderStyle;

    worksheet.getCell(`${startRow + 1}`, 1).value = "项目名称\nProject";
    worksheet.getCell(`${startRow + 1}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 1}`, 2).value = row.materialProject;
    worksheet.getCell(`${startRow + 1}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 1}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 1}`, 3).value = "零件名称\nDescription";
    worksheet.getCell(`${startRow + 1}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 1}`, 4).value = row.materialName;
    worksheet.getCell(`${startRow + 1}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 1}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 2}`, 1).value = "件号\nPart Number";
    worksheet.getCell(`${startRow + 2}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 2}`, 2).value = row.partNo;
    worksheet.getCell(`${startRow + 2}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 2}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 2}`, 3).value = "生产日期\nMFD.";
    worksheet.getCell(`${startRow + 2}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 2}`, 4).value = row.produceDate;
    worksheet.getCell(`${startRow + 2}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 2}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 1).value = "批次\nBatch NO.";
    worksheet.getCell(`${startRow + 3}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 2).value = row.batchNo;
    worksheet.getCell(`${startRow + 3}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 3}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 3).value = "数量\nQuantity";
    worksheet.getCell(`${startRow + 3}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 4).value = row.materialNum;
    worksheet.getCell(`${startRow + 3}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 3}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 4}`, 1).value = "班次\nShift";
    worksheet.getCell(`${startRow + 4}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 4}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 4}`, 2).value = row.shift;
    worksheet.getCell(`${startRow + 4}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 4}`, 2).border = borderStyle;

    let insDateRange = worksheet.getCell(`${startRow + 4}`, 3).address + ":" + worksheet.getCell(`${startRow + 5}`, 3).address;
    worksheet.mergeCells(insDateRange);
    worksheet.getCell(insDateRange).value = "检验日期\nInspection Date";
    worksheet.getCell(insDateRange).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(insDateRange).border = borderStyle;

    let insDateValRange = worksheet.getCell(`${startRow + 4}`, 4).address + ":" + worksheet.getCell(`${startRow + 5}`, 4).address;
    worksheet.mergeCells(insDateValRange);
    worksheet.getCell(insDateValRange).value = row.checkDate;
    worksheet.getCell(insDateValRange).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(insDateValRange).border = borderStyle;

    worksheet.getCell(`${startRow + 5}`, 1).value = "检验员\nInspector";
    worksheet.getCell(`${startRow + 5}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 5}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 5}`, 2).value = row.checker;
    worksheet.getCell(`${startRow + 5}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
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
  saveAs(blob, `标识卡打印${printDate}.xlsx`);
  printLoading.value = false;
  printNum.value = "";
};
</script>
