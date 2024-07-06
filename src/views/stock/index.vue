<template>
  <div class="card content-box">
    <el-row style="width: 100%">
      <el-col :span="3" v-for="(v, k) in statisticsList" :key="k">
        <el-statistic :title="v.depotName" :value="v.totalCount" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="roleManage">
import { ref } from "vue";
import { depotStatistics } from "@/api/modules/depotRecord";

const statisticsList: any = ref([]);
const getDepotStatistics = async () => {
  let res: any = await depotStatistics({});
  for (let k in res.data) {
    statisticsList.value.push(res.data[k]);
  }
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
  // statisticsList.value = [...statisticsList.value, ...statisticsList.value];
};
getDepotStatistics();

// const getRandomWarmColor = () => {
//   // 定义暖色的HSL范围
//   const hue = Math.floor(Math.random() * 60); // 0-60是红色到黄色的色调
//   const saturation = Math.floor(Math.random() * 30) + 70; // 饱和度70-100%
//   const lightness = Math.floor(Math.random() * 20) + 50; // 亮度50-70%

//   return {
//     backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`
//   };
// };

// // 将十六进制颜色转换为RGB
// function hexToRgb(hex) {
//   const bigint = parseInt(hex.substring(1), 16);
//   const r = (bigint >> 16) & 255;
//   const g = (bigint >> 8) & 255;
//   const b = bigint & 255;
//   return { r, g, b };
// }

// // 将RGB颜色转换为HSL
// function rgbToHsl(r, g, b) {
//   r /= 255;
//   g /= 255;
//   b /= 255;
//   const max = Math.max(r, g, b);
//   const min = Math.min(r, g, b);
//   let h,
//     s,
//     l = (max + min) / 2;
//   if (max === min) {
//     h = s = 0; // achromatic
//   } else {
//     const d = max - min;
//     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//     switch (max) {
//       case r:
//         h = (g - b) / d + (g < b ? 6 : 0);
//         break;
//       case g:
//         h = (b - r) / d + 2;
//         break;
//       case b:
//         h = (r - g) / d + 4;
//         break;
//     }
//     h /= 6;
//   }
//   return { h, s, l };
// }

// // 将HSL颜色转换为RGB
// function hslToRgb(h, s, l) {
//   let r, g, b;
//   if (s === 0) {
//     r = g = b = l; // achromatic
//   } else {
//     const hue2rgb = (p, q, t) => {
//       if (t < 0) t += 1;
//       if (t > 1) t -= 1;
//       if (t < 1 / 6) return p + (q - p) * 6 * t;
//       if (t < 1 / 3) return q;
//       if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
//       return p;
//     };
//     const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//     const p = 2 * l - q;
//     r = hue2rgb(p, q, h + 1 / 3);
//     g = hue2rgb(p, q, h);
//     b = hue2rgb(p, q, h - 1 / 3);
//   }
//   return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
// }

// // 将RGB颜色转换为十六进制
// function rgbToHex(r, g, b) {
//   return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
// }

// // 获取上下浮动的随机颜色
// const getRandomColorAround = (baseColorHex, range = 0.1) => {
//   const baseRgb = hexToRgb(baseColorHex);
//   const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
//   const randomH = baseHsl.h + (Math.random() * 2 - 1) * range;
//   const randomS = baseHsl.s + (Math.random() * 2 - 1) * range;
//   const randomL = baseHsl.l + (Math.random() * 2 - 1) * range;
//   const randomRgb = hslToRgb(randomH, randomS, randomL);
//   return {
//     backgroundColor: rgbToHex(randomRgb.r, randomRgb.g, randomRgb.b)
//   };
// };
</script>

<style lang="scss">
.el-statistic {
  padding: 20px;
  text-align: center;
  cursor: pointer;
  > div {
    // color: #ffffff;
  }
}
</style>
