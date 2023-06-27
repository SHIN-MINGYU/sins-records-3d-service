<script lang="ts">
import { ref, onMounted } from "@vue/runtime-core";
import EnviromentsScene from "./utils/scenes/EnviromentsScene";
import CharacterScene from "./utils/scenes/CharacterScene";

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref<HTMLCanvasElement | null>(null);
    const bootStrap = async () => {
      if (bjsCanvas.value) {
        const scene = new EnviromentsScene(bjsCanvas.value);
        scene.createBall();
        scene.createGround();
        const characterScene = new CharacterScene(scene);
        await characterScene.createCharacter();
        characterScene.attatchCameraToCharacter()
        characterScene.addMoveEventListener()
      }
    }

    onMounted(() => {
      bootStrap()
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
