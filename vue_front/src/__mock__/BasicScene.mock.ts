import { Engine, Scene,Camera, SceneLoader, Vector3, NullEngine, FreeCamera } from "@babylonjs/core";
import cannon from "cannon";
import BasicScene from "../utils/scenes/BasicScene";

class MockScene {
	scene: Scene;
	engine: Engine;
	camera : Camera;

	constructor(scene: Scene, engine: Engine, camera: Camera) {
		window.CANNON = cannon;
		this.scene = scene;
		this.engine = engine;
		this.camera = camera;

		// 初期化されたエンジンを通じシーンをレンダリング
		this.engine.runRenderLoop(() => {
			this.scene.render()
		})
	}


	createScene() {
		return this.scene
	}
		/**
	 *  モデルを読み込む関数
	 * @param {string} fileName 読み込むモデルのファイル名
	 */
		async loadModel(fileName : string, scale : Vector3 = new Vector3(1,1,1)) {
			const model = await SceneLoader.ImportMeshAsync("", "./models/", `${fileName}`, this.scene);
			model.meshes.forEach(mesh => {
				mesh.scaling = mesh.scaling.multiply(scale)
			})
			return model
		}
}

export const createMockScene  = (): BasicScene<any> => {
	const engine = new NullEngine();
	const scene = new Scene(engine);

	const camera = new FreeCamera("testCamera", new Vector3(0, 1, 0), scene);
	const mockScene: BasicScene<any> = new MockScene(scene, engine, camera)
	return mockScene 
}