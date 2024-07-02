<template>
  <div class="card content-box">
    <div>
      <video ref="video" width="300" height="200" autoplay></video>
      <button @click="startScan">开始扫描</button>
      <button @click="stopScan">停止扫描</button>
      <p v-if="result">扫描结果: {{ result }}</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="scanCode">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const video: any = ref<HTMLVideoElement | null>(null);
const result: any = ref<string | null>(null);
const codeReader: any = new BrowserMultiFormatReader();

const startScan = async () => {
  if (!video.value) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.value.srcObject = stream;

    codeReader.decodeFromVideoDevice(undefined, video.value, (scanResult, err) => {
      if (scanResult) {
        result.value = scanResult.getText();
        stopScan();
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    });
  } catch (error) {
    console.error("Error accessing camera: ", error);
  }
};

const stopScan = () => {
  if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.value.srcObject = null;
  }
  codeReader.reset();
};

onMounted(() => {
  // 初始化时自动开始扫描
  // startScan();
});

onBeforeUnmount(() => {
  stopScan();
});
</script>
