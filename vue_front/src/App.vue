<script lang="ts">
import { ref, onMounted } from "@vue/runtime-core";
import EnviromentsScene from "./utils/ EnviromentsScene";

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref<HTMLCanvasElement | null>(null);
  
    onMounted(() => {
      if (bjsCanvas.value) {
        const scene = new EnviromentsScene(bjsCanvas.value);
        scene.createGround();
      }
    });

    return {
      bjsCanvas,
    };
  },
};
</script>

<template>
  <canvas id="mainCanvas" ref="bjsCanvas" />
</template>

<style scoped>
#mainCanvas{
  height : 100vh;
  width : 100vw;
  display : block
}
</style>
