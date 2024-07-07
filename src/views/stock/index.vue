<template>
  <div class="card content-box">
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%">
      <div
        style="box-sizing: border-box; width: 49.5%; height: fit-content; margin-bottom: 12px; background: #efefef"
        v-for="(v, k) in list"
        :key="k"
      >
        <el-statistic :title="`${v.depotName}${v.isDelete ? '（已删除）' : ''}`" :value="v.totalCount" />

        <!-- <div style="padding: 0 10px 10px" v-if="v.totalCount">库存明细</div> -->
        <div
          v-if="v.totalCount"
          style="
            box-sizing: border-box;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            padding: 0 10px 10px;
          "
        >
          <div v-for="(vl, kl) in v.materials" :key="kl" style="width: calc(100% / 2)">
            <span>{{ vl.materialName }}：</span>
            <span>{{ vl.totalCount }}</span>
          </div>
        </div>
        <div
          v-else
          style="
            box-sizing: border-box;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            padding: 0 10px 10px;
          "
        >
          暂无库存
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="roleManage">
import { ref, onMounted, onUnmounted } from "vue";
import { depotStorageStatistics } from "@/api/modules/depotRecord";

const list: any = ref([]);
const getDepotStorageStatistics = async () => {
  let res: any = await depotStorageStatistics();
  res.data.forEach(el => {
    el.i = new Date().getTime();
    let index = list.value.findIndex((e: any) => e.depotId === el.depotId);
    if (index === -1) {
      list.value.push(el);
    } else {
      list.value[index] = Object.assign(list.value[index], el);
    }
  });
  list.value = res.data;
};
getDepotStorageStatistics();

let intervalId: number | undefined;

const startGet = () => {
  if (intervalId === undefined) {
    intervalId = window.setInterval(() => {
      getDepotStorageStatistics();
    }, 3000);
  }
};
const stopGet = () => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};

const handleBeforeUnload = () => {
  stopGet();
};

onMounted(() => {
  startGet();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  stopGet();
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style lang="scss">
.el-statistic {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #3975c6;
  .el-statistic__head {
    margin-bottom: 0;
    font-size: 18px;
    color: #ffffff;
  }
  .el-statistic__content {
    margin-left: 30px;
    font-size: 24px;
    color: orange;
  }
}
</style>
