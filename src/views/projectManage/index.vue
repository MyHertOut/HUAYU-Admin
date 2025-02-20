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
      <template #createTime="scope"> {{ moment(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
      <template #updateTime="scope"> {{ moment(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss") }} </template>
      <template #remark="scope"> {{ scope.row.remark || scope.row.materialBelongTo || "-" }} </template>
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
            <el-button
              type="primary"
              v-if="!scope.row.isPrintSec && scope.row.traceCodeOpen"
              link
              :icon="Printer"
              @click="isCanPrint(scope.row)"
            >
              {{ scope.row.qrBatchQty ? "继续打印" : "打印" }}
            </el-button>
            <el-button type="primary" v-if="!scope.row.qrBatchQty" link :icon="Printer" @click="isCanPrint(scope.row)">
              打印
            </el-button>
          </template>
        </el-popover>
        <el-button
          type="primary"
          link
          :icon="CopyDocument"
          v-if="!scope.row.traceCodeOpen"
          @click="openDrawer('复制', scope.row)"
        >
          复制
        </el-button>
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>

        <el-popover :visible="scope.row.downloadVisible" placement="top" :width="225">
          <div>
            <div style="margin-bottom: 5px; font-size: 12px; color: red">
              Tips:【已在库中，但是Excel丢失，请到库存列表中找到对应数据的编号前缀以及Id】【仅针对老数据】
            </div>
            <el-input v-model="printDate" style="width: 200px; margin-bottom: 5px" placeholder="请输入编号前缀" />
            <el-date-picker
              v-model="naturalDay"
              style="width: 200px"
              type="date"
              placeholder="指定自然日"
              :size="'small'"
              format="YYYY-MM-DD"
              v-if="false"
            />
            <div style="margin: 15px 0 0; text-align: right">
              <el-button size="small" text @click="(scope.row.downloadVisible = false), (printDate = ''), (naturalDay = '')">
                取消
              </el-button>
              <el-button size="small" type="primary" @click="downloadACopy(scope.row)"> 确定 </el-button>
            </div>
          </div>
          <template #reference>
            <!-- && !scope.row.traceCodeOpen -->
            <el-button type="primary" v-if="scope.row.qrBatchQty" link :icon="Download" @click="scope.row.downloadVisible = true">
              下载副本
            </el-button>
          </template>
        </el-popover>

        <el-button v-if="isAdmin" type="primary" link :icon="Delete" @click="deleteFun(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <Drawer ref="drawerRef" @print-sec-qty-fun="printSecQtyFun" />
    <ImportExcel ref="dialogRef" />
    <canvas v-show="false" ref="qrCanvas"></canvas>
    <canvas v-show="false" ref="qrCanvas2"></canvas>
  </div>
</template>

<script setup lang="tsx" name="projectManage">
import { ref, reactive, onMounted } from "vue";
import { Project } from "@/api/interface";
import { useHandleData } from "@/hooks/useHandleData";
import { useDownload } from "@/hooks/useDownload";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import Drawer from "./components/Drawer.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, View, Printer, Upload, Download, CopyDocument } from "@element-plus/icons-vue";
import { getUserList } from "@/api/modules/user";
import {
  getProjectList,
  addProject,
  editProject,
  delProject,
  exportExcelTemplate,
  exportExcel,
  importExcel,
  checkAllPrintedInDepot
} from "@/api/modules/project";
import { findMaterialDictionaryList } from "@/api/modules/materialDic";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import { base64Logo } from "./data";
import { findUserList } from "@/api/modules/user";

const isAdmin: any = ref(false);
const getAdmin = async () => {
  console.log(
    JSON.parse(localStorage["huaYu-user"]).userInfo.username,
    "JSON.parse(localStorage['huaYu-user']).userInfo.username"
  );
  let res: any = await getUserList({
    username: JSON.parse(localStorage["huaYu-user"]).userInfo.username
  } as any);
  if (res.code === "200") {
    if (res.data.items.length) {
      isAdmin.value = true;
    }
  }
  // isAdmin.value = false;
};
onMounted(() => {
  getAdmin();
});

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNo && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  // data = {
  //   items: [
  //     {
  //       id: 1,
  //       partNo: "11747025",
  //       materialName: "PHEV-1.4T热端后催进气隔热罩左半壳组件",
  //       materialProject: "test",
  //       produceDate: "08/04/2024",
  //       batchNo: "test",
  //       materialNum: 50,
  //       shift: "A",
  //       checker: "test",
  //       qrBatchQty: null,
  //       checkDate: "08/04/2024",
  //       traceCodeOpen: true,
  //       productionLine: "C",
  //       manufacturerCode: "404082460",
  //       createTime: "2024-12-03T09:40:11.000+0000",
  //       isPrintSec: false
  //     },
  //     {
  //       id: 1,
  //       partNo: "11747025",
  //       materialName: "PHEV-1.4T热端后催进气隔热罩左半壳组件",
  //       materialProject: "test",
  //       produceDate: "08/04/2024",
  //       batchNo: "test",
  //       materialNum: 50,
  //       shift: "A",
  //       checker: "test",
  //       qrBatchQty: null,
  //       checkDate: "08/04/2024",
  //       traceCodeOpen: true,
  //       productionLine: "C",
  //       manufacturerCode: "404082460",
  //       createTime: "2024-12-03T09:40:11.000+0000",
  //       isPrintSec: false
  //     }
  //   ],
  //   totalRows: 1,
  //   pageNo: 1,
  //   pageSize: 10
  // };
  data.items.forEach((e: any) => {
    e.visible = false;
    e.downloadVisible = false;
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
  newParams.createTime && (newParams.createStartDate = newParams.createTime[0]);
  newParams.createTime && (newParams.createEndDate = newParams.createTime[1]);
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

const userList: any = ref([]);
const GetUserList = async () => {
  userList.value = [];
  let res: any = await findUserList();
  if (res.code === "200") {
    userList.value = res.data;
  }
};
GetUserList();

const dealName = val => {
  let text = "";
  let item = userList.value.filter(e => e.id == val)[0];
  if (item) {
    text += `${item.username}(${item.phoneNum}) `;
  }
  return text;
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）

// 表格配置项
const columns = reactive<ColumnProps<Project.ResProjectList>[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "id", label: "Id", width: 100 },
  {
    prop: "partNo",
    label: "件号",
    enum: materialDicList,
    search: { el: "select", props: { filterable: true, filterMethod: true, allowCreate: true } },
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
  { prop: "remark", label: "标识卡备注", width: 100 },
  { prop: "productionLine", label: "生产线", width: 100 },
  { prop: "manufacturerCode", label: "厂商编码", width: 100 },
  {
    prop: "createTime",
    label: "创建时间",
    search: {
      el: "date-picker",
      span: 2,
      props: { type: "daterange", valueFormat: "YYYY-MM-DD" },
      defaultValue: []
    },
    width: 180
  },
  { prop: "updateTime", label: "更新时间", width: 180 },
  {
    prop: "creatorId",
    label: "创建人",
    enum: userList,
    search: { el: "select", props: { filterable: true, filterMethod: false, allowCreate: false } },
    fieldNames: { label: "username", value: "id" },
    isFilterEnum: true,
    render: scope => {
      return <span>{dealName(scope.row.creatorId)}</span>;
    },
    width: 180
  },
  { prop: "operation", label: "操作", fixed: "right", width: 310 }
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
const openDrawer = (title: string, row: Partial<Project.ResProjectList> = {}, isPrintSec?: boolean) => {
  console.log(title);
  const params = {
    title,
    isView: title === "查看",
    materialDicList: materialDicList.value,
    row: { ...row },
    api: title === "新增" || title === "复制" || title === "继续打印" ? addProject : title === "编辑" ? editProject : undefined,
    getTableList: proTable.value?.getTableList,
    isPrintSec: isPrintSec
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
let printDate: any = ref();
let canPrint: any = ref(false);
let latestInDepotRecord: any = ref({});
let printPreQty: any = ref(0);
let naturalDay: any = ref("");

const dealNaturalDay = (naturalDay: string, productionLine: string, shift: string) => {
  // 从naturalDay中移除productionLine和shift，得到实际日期字符串
  const realDate = naturalDay.replace(productionLine + shift, "").slice(0, 5);
  // 获取当前日期，格式化为YYYYMMDD
  // 获取当前日期
  const now: any = new Date();
  // 获取年份后两位
  const year = now.getFullYear().toString().slice(-2);
  // 获取一年中的第几天 (1-366)
  let dayOfYear: number = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  if (now.getDate() < 10) {
    dayOfYear += 1; // 小于 10 号，加一天
  }
  const dayStr = dayOfYear.toString().padStart(3, "0");
  const currentDate = year + dayStr;
  // 比较是否是当天
  return realDate === currentDate;
};

const getPrintPreQty = (traceCode: string, productionLine: string, shift: string) => {
  return Number(traceCode.replace(productionLine + shift, "").slice(5, 9));
};

const isCanPrint = async (row: any) => {
  if (!row.qrBatchQty) {
    row.visible = true;
  } else {
    let res: any = await checkAllPrintedInDepot({ id: row.id });
    if (res.code === "200") {
      canPrint.value = res.data.isAllPrintedInDepot;
      latestInDepotRecord.value = res.data.latestInDepotRecord;
    }
    if (!canPrint.value) {
      ElMessage.error("上一批生产任务还未全部入库！");
      return;
    } else {
      // printSecQtyFun(row);
      // return;
      openDrawer("继续打印", row, true);
    }
  }
};

const printSecQtyFun = (row: any) => {
  let isNaturalDay = dealNaturalDay(
    latestInDepotRecord.value.traceCode.split("_")[3],
    latestInDepotRecord.value.productionLine,
    latestInDepotRecord.value.shift
  );
  console.log(isNaturalDay, "isNaturalDay");
  if (isNaturalDay) {
    printPreQty.value = getPrintPreQty(
      latestInDepotRecord.value.traceCode.split("_")[3],
      latestInDepotRecord.value.productionLine,
      latestInDepotRecord.value.shift
    );
    console.log(printPreQty.value, "printPreQty");
  } else {
    printPreQty.value = 0;
  }
  let date = moment(new Date(row.createTime)).format("YYYYMMDDHHmmss");
  printFun(row, date, printPreQty.value);
};

const printPreFun = async (row: any) => {
  if (!printNum.value) {
    return;
  }

  row.visible = false;
  printLoading.value = true;
  row.qrBatchQty = printNum.value;
  row.printedQty = printNum.value;
  let res: any = await editProject(row);
  if (res.code === "200") {
    let date = moment(new Date(row.createTime)).format("YYYYMMDDHHmmss");
    setTimeout(() => {
      printFun(row, date);
    }, 1000);
  }
};

const downloadACopy = (row: any) => {
  console.log(row, "row");
  printLoading.value = true;
  ElNotification({
    title: "温馨提示",
    message: "如果数据庞大会导致下载缓慢哦，请您耐心等待！",
    type: "info",
    duration: 1000
  });
  let date = printDate.value ? printDate.value : moment(new Date(row.createTime)).format("YYYYMMDDHHmmss");
  if (row.traceCodeOpen && row.printedQty) {
    printFun(row, date, row.printedQty - row.qrBatchQty);
  } else {
    printFun(row, date);
  }
  printDate.value = "";
};

const generatePackageCode = (row: any, index: number) => {
  // 获取当前日期
  const now: any = naturalDay.value ? new Date(naturalDay.value) : new Date();
  console.log(now, "now");
  // 获取年份后两位
  const year = now.getFullYear().toString().slice(-2);

  // 获取一年中的第几天 (1-366)
  let dayOfYear: number = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
  console.log(dayOfYear, "dayOfYear");
  if (now.getDate() < 10) {
    dayOfYear += 1; // 小于 10 号，加一天
  }
  const dayStr = dayOfYear.toString().padStart(3, "0"); // 自然日
  console.log(dayStr, "dayStr");
  // 假设这些数据从props或其他地方获取
  const productionLine = row.productionLine; // 生产线代码
  const teamCode = row.shift; // 班组代码 (A或B)
  const boxNumber = index.toString().padStart(4, "0"); // 包装箱序号，需要根据实际情况生成
  const defaultValue = "0"; // 默认值
  const partNumber = row.partNo; // 零件号，需要从实际数据中获取

  // 组合编码
  const res = `${productionLine}${teamCode}${year}${dayStr}${boxNumber}${defaultValue}${partNumber}`;
  naturalDay.value = "";
  return res;
};

// 打印
const qrCanvas: any = ref(null);
const qrCanvas2: any = ref(null);
let base64Image: any = ref(null);
let huiSuBase64Image: any = ref(null);
const printFun = async (row: any, date?: string, printPreQty?: number) => {
  // 创建一个新的工作簿
  const workbook: any = new ExcelJS.Workbook();
  const worksheet: any = workbook.addWorksheet("Material Label");

  const globalFontStyle = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 20 };

  const borderStyle = {
    top: { style: "medium" },
    left: { style: "medium" },
    bottom: { style: "medium" },
    right: { style: "medium" }
  };
  let printDate = date;
  let printQty = 0;
  if (printPreQty) {
    printQty = printPreQty;
  }
  for (let i = 0; i < row.qrBatchQty; i++) {
    let keyIndex;
    if (row.traceCodeOpen) {
      keyIndex = 9;
    } else {
      keyIndex = 8;
    }

    // 设置列宽和行高
    worksheet.getColumn(1).width = 18.69;
    worksheet.getColumn(2).width = 28;
    worksheet.getColumn(3).width = 28;
    worksheet.getColumn(4).width = 28;
    worksheet.getRow(keyIndex * i + 1).height = 140;
    worksheet.getRow(keyIndex * i + 2).height = 80;
    worksheet.getRow(keyIndex * i + 3).height = 80;
    worksheet.getRow(keyIndex * i + 4).height = 80;
    worksheet.getRow(keyIndex * i + 5).height = 80;
    worksheet.getRow(keyIndex * i + 6).height = 80;
    worksheet.getRow(keyIndex * i + 7).height = 40;

    if (row.traceCodeOpen) {
      worksheet.getRow(keyIndex * i + 8).height = 580;
    }

    worksheet.getRow(keyIndex * i + 1).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 2).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 3).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 4).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 5).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 6).font = globalFontStyle;
    worksheet.getRow(keyIndex * i + 7).font = globalFontStyle;

    if (row.traceCodeOpen) {
      worksheet.getRow(keyIndex * i + 8).font = globalFontStyle;
    }
    console.log(printQty, "printQty", i, i + 1 + printQty, `${i + 1 + printQty}`, row.traceCodeOpen);
    let printNo = `${printDate}-${i + 1 + printQty}`;
    let QRCodeUrl = `${row.id}|${printNo}`;
    let QRCodeUrlHuiSu = "";
    if (row.traceCodeOpen) {
      // 将 materialNum 格式化为6位字符串，不足前面补0
      const formattedNum = row.materialNum.toString().padStart(6, "0");
      const packageCode = generatePackageCode(row, i + 1 + printQty);
      console.log(packageCode, "packageCode");
      QRCodeUrlHuiSu = `${row.partNo}_${row.manufacturerCode ? row.manufacturerCode : "404082460"}_${formattedNum}_${packageCode}`;
      console.log(QRCodeUrlHuiSu, "QRCodeUrlHuiSu");
      QRCodeUrl = QRCodeUrl + "|" + QRCodeUrlHuiSu;
    }
    let base64ImageLogo = base64Logo;
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
      tl: { col: 0, row: keyIndex * i, offsetX: offsetX, offsetY: offsetY }, // top-left position of the image
      br: { col: 1, row: keyIndex * i + 1, offsetX: -offsetX, offsetY: -offsetY }, // 图片的右下角位置，相对于起始位置的偏移
      ext: { width: 120, height: 120 }, // size of the image
      editAs: "oneCell"
      // offsets: {
      //   x: (18.69 * 7.5 - 100) / 2, // 图片水平偏移
      //   y: (140 * 0.75 - 100) / 2 // 图片垂直偏移
      // }
    });
    worksheet.getCell(`A${keyIndex * i + 1}`).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`A${keyIndex * i + 1}`).border = borderStyle;

    let startRow = keyIndex * i + 1;
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

    base64Image.value = await generateQRCodeWithBorder(QRCodeUrl);
    if (!base64Image.value) {
      return;
    }
    base64Image.value = base64Image.value.replace("data:image/png;base64,", "");
    const imageArrayBuffer = base64ToUint8Array(base64Image.value);
    // 插入图片
    const imageId = workbook.addImage({
      buffer: imageArrayBuffer,
      extension: "png"
    });
    worksheet.addImage(imageId, {
      tl: { col: 3, row: keyIndex * i }, // top-left position of the image
      br: { col: 4, row: keyIndex * i + 1 }, // 图片的右下角位置，相对于起始位置的偏移
      extension: { width: 120, height: 120 }, // size of the image
      editAs: "oneCell"
    });

    worksheet.getCell(`D${keyIndex * i + 1}`).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(`D${keyIndex * i + 1}`).border = borderStyle;

    worksheet.getCell(`${startRow + 1}`, 1).value = "项目名称\nProject";
    worksheet.getCell(`${startRow + 1}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 1}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 1}`, 2).value = row.materialProject;
    worksheet.getCell(`${startRow + 1}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 1}`, 2).border = borderStyle;

    let materialNameRange =
      worksheet.getCell(`${startRow + 1}`, 3).address + ":" + worksheet.getCell(`${startRow + 2}`, 3).address;
    worksheet.mergeCells(materialNameRange);
    worksheet.getCell(materialNameRange).value = "零件名称\nDescription";
    worksheet.getCell(materialNameRange).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(materialNameRange).border = borderStyle;

    let materialNameValRange =
      worksheet.getCell(`${startRow + 1}`, 4).address + ":" + worksheet.getCell(`${startRow + 2}`, 4).address;
    worksheet.mergeCells(materialNameValRange);
    worksheet.getCell(materialNameValRange).value = row.materialName;
    worksheet.getCell(materialNameValRange).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(materialNameValRange).border = borderStyle;

    worksheet.getCell(`${startRow + 2}`, 1).value = "件号\nPart Number";
    worksheet.getCell(`${startRow + 2}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 2}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 2}`, 2).value = row.partNo;
    worksheet.getCell(`${startRow + 2}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 2}`, 2).font = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 22 };
    worksheet.getCell(`${startRow + 2}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 3).value = "生产日期\nMFD.";
    worksheet.getCell(`${startRow + 3}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 4).value = row.produceDate;
    worksheet.getCell(`${startRow + 3}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 3}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 3}`, 1).value = "批次\nBatch NO.";
    worksheet.getCell(`${startRow + 3}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 3}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 3}`, 2).value = row.batchNo;
    worksheet.getCell(`${startRow + 3}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 3}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 4}`, 3).value = "数量\nQuantity";
    worksheet.getCell(`${startRow + 4}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 4}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 4}`, 4).value = row.materialNum;
    worksheet.getCell(`${startRow + 4}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 4}`, 4).font = { bold: true, color: { argb: "000000" }, name: "Arial", family: 2, size: 22 };
    worksheet.getCell(`${startRow + 4}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 4}`, 1).value = "班次\nShift";
    worksheet.getCell(`${startRow + 4}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 4}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 4}`, 2).value = row.shift;
    worksheet.getCell(`${startRow + 4}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 4}`, 2).border = borderStyle;

    worksheet.getCell(`${startRow + 5}`, 3).value = "检验日期\nInspection Date";
    worksheet.getCell(`${startRow + 5}`, 3).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 5}`, 3).border = borderStyle;
    worksheet.getCell(`${startRow + 5}`, 4).value = row.checkDate;
    worksheet.getCell(`${startRow + 5}`, 4).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 5}`, 4).border = borderStyle;

    worksheet.getCell(`${startRow + 5}`, 1).value = "检验员\nInspector";
    worksheet.getCell(`${startRow + 5}`, 1).alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
    worksheet.getCell(`${startRow + 5}`, 1).border = borderStyle;
    worksheet.getCell(`${startRow + 5}`, 2).value = row.checker;
    worksheet.getCell(`${startRow + 5}`, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    worksheet.getCell(`${startRow + 5}`, 2).border = borderStyle;

    let endDateNoRange = worksheet.getCell(`${startRow + 6}`, 1).address + ":" + worksheet.getCell(`${startRow + 6}`, 4).address;
    worksheet.mergeCells(endDateNoRange);
    worksheet.getCell(endDateNoRange).value = `${printDate}-${i + 1 + printQty}`;
    worksheet.getCell(endDateNoRange).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell(endDateNoRange).border = borderStyle;

    if (row.traceCodeOpen) {
      huiSuBase64Image.value = await generateHuiSuQRCode(QRCodeUrlHuiSu);
      if (!huiSuBase64Image.value) {
        return;
      }
      huiSuBase64Image.value = huiSuBase64Image.value.replace("data:image/png;base64,", "");
      const imageArrayBufferHuiSu = base64ToUint8Array(huiSuBase64Image.value);
      const imageIdHuiSu = workbook.addImage({
        buffer: imageArrayBufferHuiSu,
        extension: "png"
      });

      // let huiSuMergeRange =
      //   worksheet.getCell(`${startRow + 7}`, 1).address + ":" + worksheet.getCell(`${startRow + 7}`, 4).address;
      // worksheet.mergeCells(huiSuMergeRange);
      // worksheet.getCell(huiSuMergeRange).border = borderStyle;

      // 计算单元格的实际宽度和高度
      const cellWidth = 18.69 * 4 * 7.5; // 4个合并单元格的总宽度
      const cellHeight = 580 * 0.75; // 单元格高度

      // 计算居中偏移量
      const offsetX = (cellWidth - 400) / 2; // 单元格宽度减去图片宽度除以2
      const offsetY = (cellHeight - 120) / 2; // 单元格高度减去图片高度除以2

      worksheet.addImage(imageIdHuiSu, {
        tl: { col: 0, row: keyIndex * i + 7, offsetX, offsetY },
        br: { col: 4, row: keyIndex * i + 8, offsetX: -offsetX, offsetY: -offsetY },
        extension: { width: 400, height: 120 },
        editAs: "oneCell"
      });

      let endMergeRange = worksheet.getCell(`${startRow + 8}`, 1).address + ":" + worksheet.getCell(`${startRow + 8}`, 4).address;
      worksheet.mergeCells(endMergeRange);
    } else {
      let endMergeRange = worksheet.getCell(`${startRow + 7}`, 1).address + ":" + worksheet.getCell(`${startRow + 7}`, 4).address;
      worksheet.mergeCells(endMergeRange);
    }
  }

  // 导出 Excel 文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `标识卡打印${printDate}.xlsx`);
  printLoading.value = false;
  printNum.value = "";
  proTable.value?.getTableList();
};

const generateQRCodeWithBorder = async (text: any) => {
  return new Promise(resolve =>
    setTimeout(async () => {
      try {
        const qrDataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: "H",
          width: 200,
          margin: 0 // 不在 QR 码生成阶段添加边距
        });

        const canvas = qrCanvas.value;
        const ctx = canvas.getContext("2d");

        // 设置画布尺寸（宽度和高度稍大于 QR 码）
        canvas.width = 200;
        canvas.height = 200;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // 加载 QR 码图像
        const qrImage = new Image();
        qrImage.src = qrDataUrl;
        qrImage.onload = () => {
          // 绘制 QR 码到 Canvas 上，留出边框空间
          ctx.drawImage(qrImage, 20, 20, 164, 164);
          resolve(canvas.toDataURL("image/png"));
        };
      } catch (err) {
        console.error(err);
      }
    }, 0)
  );
};

const generateHuiSuQRCode = async (text: any) => {
  return new Promise(resolve =>
    setTimeout(async () => {
      try {
        // 1. 提高DPI和画布尺寸
        const DPI = 7.56; // 将DPI提高一倍 (原来是3.78)
        const CANVAS_WIDTH = Math.round(120 * DPI);
        const CANVAS_HEIGHT = Math.round(120 * DPI);
        const QR_SIZE = Math.round(30 * DPI);

        // 2. 提高二维码生成质量
        const qrDataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: "H",
          width: QR_SIZE,
          margin: 0,
          quality: 1.0, // 最高质量
          scale: 4 // 增加二维码的缩放比例
        });

        const canvas = qrCanvas.value;
        const ctx = canvas.getContext("2d", {
          // 3. 添加canvas上下文配置
          alpha: false,
          antialias: true,
          willReadFrequently: true
        });

        // 4. 启用图像平滑
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 设置画布尺寸
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 5. 使用更高的缩放比进行绘制
        ctx.scale(1, 1);

        // 清空画布
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制边框
        // ctx.strokeStyle = "black";
        // ctx.lineWidth = 2; // 增加边框宽度
        // ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // 加载并绘制二维码
        const qrImage = new Image();
        qrImage.src = qrDataUrl;
        await new Promise(resolve => {
          qrImage.onload = resolve;
        });

        // 6. 使用更精确的定位计算
        const qrY = Math.round((CANVAS_HEIGHT - QR_SIZE) / 2);
        ctx.drawImage(qrImage, 175, qrY, QR_SIZE, QR_SIZE);

        // 7. 优化文字渲染
        const fontSize = Math.round(4 * DPI);
        ctx.textRendering = "geometricPrecision";
        ctx.fontKerning = "normal";
        ctx.font = `bold ${fontSize}px "Arial Narrow"`;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";

        const [num1, num2, num3, num4] = text.split("_");
        const textX = QR_SIZE + 225;
        const baseSize = Math.round(4 * DPI);
        const largeSize = Math.round(8 * DPI);
        const lineHeight = largeSize * 1.2;
        const textStartY = qrY + (QR_SIZE - lineHeight * 3) / 2 - 10;

        // 8. 使用更精确的文本绘制
        const firstFour = num1.slice(0, 4);
        const lastFour = num1.slice(4);

        ctx.font = `bold ${baseSize}px "Arial Narrow"`;
        ctx.fillText(firstFour, textX, textStartY + lineHeight);

        const firstFourWidth = ctx.measureText(firstFour).width;

        ctx.font = `bold ${largeSize}px "Arial Narrow"`;
        ctx.fillText(lastFour, textX + firstFourWidth, textStartY + lineHeight);

        ctx.font = `bold ${baseSize}px "Arial Narrow"`;
        ctx.fillText(`${num2}        ${num3}`, textX, textStartY + lineHeight * 2);
        ctx.fillText(num4, textX, textStartY + lineHeight * 3);

        // 9. 使用更高质量的图片导出
        resolve(canvas.toDataURL("image/png", 1.0));
      } catch (err) {
        console.error(err);
      }
    }, 0)
  );
};
</script>
