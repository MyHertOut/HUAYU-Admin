<template>
  <div class="scanCode card content-box">
    <div style="margin-bottom: 20px" v-if="!isStart">请录入基础信息</div>
    <el-form ref="ruleFormRef" style="width: 100%" :rules="rules" :model="params" label-position="top" v-if="!isStart">
      <el-form-item label="操作类型" prop="operateType">
        <el-radio-group v-model="params.operateType">
          <el-radio :value="1" size="default">入库</el-radio>
          <el-radio :value="3" size="default">转库</el-radio>
          <el-radio :value="2" size="default">出库</el-radio>
        </el-radio-group>
      </el-form-item>

      <div style="padding: 10px; background: #efefef" v-if="params.operateType === 1 || params.operateType === 3">
        <el-form-item label="仓库" prop="depotId">
          <el-select
            @focus="GetDepotList()"
            v-model="params.depotId"
            filterable
            default-first-option
            placeholder="请选择仓库"
            clearable
          >
            <el-option v-for="(item, key) in depotList" :key="key" :label="item.depotName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库位号" prop="depotLocationId">
          <el-select
            @focus="GetDepotLocationList()"
            v-model="params.depotLocationId"
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            placeholder="输入查询，未找到的亦可创建"
            clearable
          >
            <el-option v-for="(item, key) in depotLocationList" :key="key" :label="item.locationNo" :value="item.id" />
          </el-select>
        </el-form-item>
        <!-- v-if="!isDepotLocationIdHave" -->
        <el-form-item :label="params.operateType === 1 ? '入库备注' : '出库备注'" prop="depotLocationDesc">
          <el-input v-model="params.depotLocationDesc" placeholder="请输入备注" clearable></el-input>
        </el-form-item>
      </div>
      <div style="padding: 10px; background: #efefef" v-if="params.operateType === 2">
        <el-form-item label="出库备注" prop="depotLocationDesc">
          <el-input v-model="params.depotLocationDesc" placeholder="请输入备注" clearable></el-input>
        </el-form-item>
      </div>
    </el-form>

    <el-button style="margin-top: 20px" v-if="!isStart" type="primary" @click="startScan">开始扫描</el-button>
    <div class="content-box">
      <video ref="video" class="videoBox" autoplay v-show="isStart"></video>
      <div style="margin-top: 20px" v-if="isStart">
        <el-button @click="stopScan">重新录入基本信息</el-button>
        <el-button type="primary" @click="nextUpload">下一个</el-button>
      </div>
      <!-- <p v-if="result">扫描结果: {{ result }}</p> -->
    </div>
  </div>
</template>

<script setup lang="ts" name="scanCode">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { findDepotList, findDepotLocationList } from "@/api/modules/depot";
import { addDepotRecord } from "@/api/modules/depotRecord";

const params: any = ref({
  depotId: null,
  depotLocationDesc: "",
  depotLocationId: null,
  depotLocationNo: "",
  materialId: null,
  operateType: 1,
  qrSerialNo: ""
});

const rules = reactive({
  operateType: [{ required: true, message: "请选择操作类型" }],
  depotId: [{ required: true, message: "请选择仓库" }],
  depotLocationId: [{ required: true, message: "请选择或创建库位" }]
  // depotLocationDesc: [{ required: true, message: "请输入库位描述" }]
});

const depotList: any = ref([]);
const GetDepotList = async () => {
  depotList.value = [];
  let res: any = await findDepotList();
  if (res.code === "200") {
    depotList.value = res.data;
  }
};
GetDepotList();

const depotLocationList: any = ref([]);
const GetDepotLocationList = async () => {
  depotLocationList.value = [];
  let res: any = await findDepotLocationList({
    depotId: params.value.depotId
  });
  if (res.code === "200") {
    depotLocationList.value = res.data;
  }
};
GetDepotLocationList();

// const isDepotLocationIdHave = computed(() => {
//   let depotLocationId = params.value.depotLocationId;
//   if (!depotLocationId) {
//     return true;
//   } else {
//     let index = depotLocationList.value.findIndex((e: any) => e.id === depotLocationId);
//     return index !== -1 ? true : false;
//   }
// });

watch(
  () => params.value.operateType,
  n => {
    params.value = {
      operateType: n,
      sourceDepotId: null,
      depotLocationNo: null,
      sourceLocationDescribe: "",
      targetDepotId: null,
      targetLocationNo: null,
      targetLocationDescribe: "",
      materialId: null,
      qrSerialNo: ""
    };
  }
);

const isStart = ref(false);
const video: any = ref<HTMLVideoElement | null>(null);
const result: any = ref<string | null>(null);
const codeReader: any = new BrowserMultiFormatReader();

const isUploading: any = ref(false);
const ruleFormRef = ref<FormInstance>();

const messageInstance: any = ref(null);

const startScan = async () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    if (!video.value) return;
    isStart.value = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.value.srcObject = stream;

      codeReader.decodeFromVideoDevice(undefined, video.value, async (scanResult, err) => {
        if (scanResult) {
          result.value = scanResult.getText();
          // result.value = "25|20240801130894-10";
          params.value.materialId = result.value.split("|")[0];
          params.value.qrSerialNo = result.value.split("|")[1];
          if (result.value.split("|").length > 2) {
            params.value.traceCode = result.value.split("|")[2];
          }
          if (!isUploading.value) {
            isUploading.value = true;
            let data = {};
            if (params.value.operateType === 1 || params.value.operateType === 3) {
              let index = depotLocationList.value.findIndex((e: any) => e.id === params.value.depotLocationId);
              if (index === -1) {
                data = {
                  depotId: params.value.depotId,
                  depotLocationDesc: params.value.depotLocationDesc,
                  depotLocationNo: params.value.depotLocationId,
                  materialId: params.value.materialId,
                  operateType: params.value.operateType,
                  qrSerialNo: params.value.qrSerialNo,
                  traceCode: params.value.traceCode || ""
                };
              } else {
                data = {
                  depotId: params.value.depotId,
                  depotLocationDesc: params.value.depotLocationDesc,
                  depotLocationId: params.value.depotLocationId,
                  materialId: params.value.materialId,
                  operateType: params.value.operateType,
                  qrSerialNo: params.value.qrSerialNo,
                  traceCode: params.value.traceCode || ""
                };
              }
            } else {
              data = {
                depotLocationDesc: params.value.depotLocationDesc,
                materialId: params.value.materialId,
                operateType: params.value.operateType,
                qrSerialNo: params.value.qrSerialNo,
                traceCode: params.value.traceCode || ""
              };
            }
            addDepotRecord(data)
              .then(() => {
                if (params.value.operateType === 1) {
                  messageInstance.value = ElMessage.success({
                    duration: 0,
                    customClass: "scanMessage",
                    message: `${params.value.qrSerialNo}入库成功`
                  });
                } else if (params.value.operateType === 3) {
                  messageInstance.value = ElMessage.success({
                    duration: 0,
                    customClass: "scanMessage",
                    message: `${params.value.qrSerialNo}转库成功`
                  });
                } else if (params.value.operateType === 2) {
                  messageInstance.value = ElMessage.success({
                    duration: 0,
                    customClass: "scanMessage",
                    message: `${params.value.qrSerialNo}出库成功`
                  });
                }
              })
              .catch(err => {
                console.log(err);
                if (params.value.operateType === 1) {
                  messageInstance.value = ElMessage.error({
                    duration: 0,
                    customClass: "scanMessage",
                    message: `${params.value.qrSerialNo}已入库`
                  });
                } else if (params.value.operateType === 3) {
                  if (err.response.data.message.includes("Index")) {
                    messageInstance.value = ElMessage.error({
                      duration: 0,
                      customClass: "scanMessage",
                      message: `${params.value.qrSerialNo}已出库`
                    });
                  } else {
                    messageInstance.value = ElMessage.error({
                      duration: 0,
                      customClass: "scanMessage",
                      message: `${params.value.qrSerialNo}已转库`
                    });
                  }
                } else if (params.value.operateType === 2) {
                  messageInstance.value = ElMessage.error({
                    duration: 0,
                    customClass: "scanMessage",
                    message: `${params.value.qrSerialNo}已出库`
                  });
                }
              });
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      });
    } catch (error) {
      console.error("Error accessing camera: ", error);
    }
  });
  return;
};

const nextUpload = () => {
  isUploading.value = false;
  if (messageInstance.value) {
    messageInstance.value.close();
  }
};

const stopScan = () => {
  if (messageInstance.value) {
    messageInstance.value.close();
  }
  if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.value.srcObject = null;
  }
  codeReader.reset();
  isStart.value = false;
  isUploading.value = false;
};

onMounted(() => {
  // 初始化时自动开始扫描
  // startScan();
});

onBeforeUnmount(() => {
  stopScan();
});
</script>

<style lang="scss" scope>
.scanCode {
  width: 100vw;
  height: 100vh;
  padding: 16px;
  color: #000000;
  background: #ffffff;
  .videoBox {
    width: 100%;
    height: 450px;
    object-fit: cover;
  }
}
.scanMessage .el-message__content {
  white-space: pre;
}
</style>
