<script lang="ts">
import { ref, onMounted } from "@vue/runtime-core";
import EnviromentsScene from "./utils/scenes/EnviromentsScene";
import CharacterScene from "./utils/scenes/CharacterScene";
import BasicScene from "./utils/scenes/BasicScene";
import HavokPhysics from "@babylonjs/havok";
import { Inspector } from '@babylonjs/inspector';
import {MeshBuilder } from "@babylonjs/core";
// import { Vector3, HavokPlugin } from "@babylonjs/core";

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref<HTMLCanvasElement | null>(null)
   
    const bootStrap = async () => {
      if (bjsCanvas.value) {

        const basicScene = new BasicScene(bjsCanvas.value);

        HavokPhysics().then((_) => {
          
			  basicScene.scene.enablePhysics();
   
        const scene = new EnviromentsScene(basicScene);

        const baseData = [[-5, 0], [5, 0], [5, 6], [2, 6], [2, 9], [-5, 9]].map(el => 
          el.map(e => e*3)
        );

        const corners = baseData.map(scene.createCorner);

        const walls = corners.map(scene.createWall)

        const ply = 0.3;
        const height = 10;
          scene.buildHouse(walls, ply, height);
        
        new CharacterScene(scene);
        Inspector.Show(scene.scene, { overlay: true })
        MeshBuilder.CreateGround("GROUND", { width: 40, height: 100 },scene.scene)
			});

         
      }
    }

    onMounted(async () => {
      await  bootStrap()
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
