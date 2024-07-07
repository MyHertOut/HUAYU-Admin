<template>
  <div class="waterfall-container" ref="waterfallContainer">
    <div
      v-for="(item, index) in itemPositions"
      :key="index"
      class="waterfall-item"
      :style="{ top: item.top + 'px', left: item.left + 'px', height: item.height + 'px' }"
      ref="waterfallItems"
    >
      <img :src="item.src" :alt="item.alt" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";

interface Props {
  items?: any;
}

interface Item {
  src: string;
  alt: string;
  top?: number;
  left?: number;
  height?: number;
}
const props = withDefaults(defineProps<Props>(), {
  items: []
});
const waterfallContainer = ref<HTMLDivElement | null>(null);
const waterfallItems = ref<HTMLDivElement[]>([]);
const containerWidth = ref(0);
const columnHeights = ref<number[]>([]);
const itemPositions = ref<Item[]>([]);

const initializeWaterfall = () => {
  if (!waterfallContainer.value || !waterfallItems.value.length) return;

  containerWidth.value = waterfallContainer.value.clientWidth;
  const itemWidth = waterfallItems.value[0].clientWidth;
  const columns = Math.floor(containerWidth.value / itemWidth);

  columnHeights.value = Array(columns).fill(0);
  console.log(1);
  itemPositions.value = props.items.map((item, index) => {
    const column = columnHeights.value.indexOf(Math.min(...columnHeights.value));
    const top = columnHeights.value[column];
    const left = column * itemWidth;
    const height = waterfallItems.value[index].clientHeight;

    columnHeights.value[column] += height;

    return { ...item, top, left, height };
  });
};

onMounted(() => {
  nextTick(() => {
    initializeWaterfall();
  });
  window.addEventListener("resize", initializeWaterfall);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", initializeWaterfall);
});

watch(
  () => props.items,
  () => {
    nextTick(() => {
      initializeWaterfall();
    });
  }
);
</script>

<style scoped>
.waterfall-container {
  position: relative;
  width: 100%;
}
.waterfall-item {
  position: absolute;
  box-sizing: border-box;
  width: 200px; /* 你可以根据需要调整宽度 */
  overflow: hidden;
}
.waterfall-item img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
