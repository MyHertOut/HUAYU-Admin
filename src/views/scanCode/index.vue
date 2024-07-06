<template>
  <div class="scanCode card content-box">
    <div style="margin-bottom: 20px" v-if="!isStart">请录入基础信息</div>
    <el-form ref="ruleFormRef" style="width: 100%" :rules="rules" :model="params" label-position="top" v-if="!isStart">
      <el-form-item label="操作类型" prop="operateType">
        <el-radio-group v-model="params.operateType">
          <el-radio :value="1" size="default">入库</el-radio>
          <el-radio :value="2" size="default">出库</el-radio>
          <el-radio :value="3" size="default">转库</el-radio>
        </el-radio-group>
      </el-form-item>

      <div style="padding: 10px; background: #efefef">
        <el-form-item label="源仓库" prop="sourceDepotId" v-if="params.operateType === 2 || params.operateType === 3">
          <el-select v-model="params.sourceDepotId" filterable default-first-option placeholder="请选择源仓库" clearable>
            <el-option v-for="(item, key) in depotList" :key="key" :label="item.depotName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="源仓-库位号" prop="sourceLocationNo" v-if="params.operateType === 2 || params.operateType === 3">
          <el-input v-model="params.sourceLocationNo" placeholder="请输入源仓-库位号" clearable></el-input>
        </el-form-item>
        <el-form-item
          label="源仓-库位描述"
          prop="sourceLocationDescribe"
          v-if="params.operateType === 2 || params.operateType === 3"
        >
          <el-input v-model="params.sourceLocationDescribe" placeholder="请输入源仓-库位描述" clearable></el-input>
        </el-form-item>
      </div>

      <div style="padding: 10px; background: #efefef">
        <el-form-item label="目标仓库" prop="targetDepotId" v-if="params.operateType === 1 || params.operateType === 3">
          <el-select v-model="params.targetDepotId" filterable default-first-option placeholder="请选择目标仓库" clearable>
            <el-option v-for="(item, key) in depotList" :key="key" :label="item.depotName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标仓-库位号" prop="targetLocationNo" v-if="params.operateType === 1 || params.operateType === 3">
          <el-input v-model="params.targetLocationNo" placeholder="请输入目标仓-库位号" clearable></el-input>
        </el-form-item>
        <el-form-item
          label="目标仓-库位描述"
          prop="targetLocationDescribe"
          v-if="params.operateType === 1 || params.operateType === 3"
        >
          <el-input v-model="params.targetLocationDescribe" placeholder="请输入目标仓-库位描述" clearable></el-input>
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
import { findDepotList } from "@/api/modules/depot";
import { addDepotRecord } from "@/api/modules/depotRecord";

const params: any = ref({
  operateType: 1,
  sourceDepotId: null,
  sourceLocationNo: null,
  sourceLocationDescribe: "",
  targetDepotId: null,
  targetLocationNo: null,
  targetLocationDescribe: "",
  materialId: null,
  qrSerialNo: ""
});

const rules = reactive({
  operateType: [{ required: true, message: "请选择操作类型" }],
  sourceDepotId: [{ required: true, message: "请选择源仓库" }],
  targetDepotId: [{ required: true, message: "请选择目标仓库" }]
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
watch(
  () => params.value.operateType,
  n => {
    params.value = {
      operateType: n,
      sourceDepotId: null,
      sourceLocationNo: null,
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

const startScan = async () => {
  console.log(video.value);

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
          params.value.materialId = result.value.split("|")[0];
          params.value.qrSerialNo = result.value.split("|")[1];
          if (!isUploading.value) {
            isUploading.value = true;
            await addDepotRecord(params.value);
            ElMessage.success({ message: `录入成功,请点击【下一个】继续录入` });
          }
          // stopScan();
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
};

const stopScan = () => {
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
</style>
