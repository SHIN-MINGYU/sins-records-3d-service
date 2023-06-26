import { Camera, Engine, FreeCamera, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { ChildrenScene, ParentScene, IBasicScene,  isTypeParentScene } from "../../types/scene.type";

/**
 * @description 全てのシーンについた共通的な部分を集めたクラス
 */
export default class BasicScene<T extends IBasicScene> {
	scene: Scene;
	engine: Engine;
	camera: Camera;

	constructor(arg: T) {
		// シナリオ1．もし該当シーンが初めて作られることだとしたら
		if (isTypeParentScene(arg)) {
			const canvas = arg
			// エンジン初期化
			this.engine = new Engine(canvas as ParentScene, true)

			// シーン初期化
			this.scene = this.createScene();

			// カメラ初期化(一時的なコード)
			this.camera = new FreeCamera("testCamera", new Vector3(0, 1, 0), this.scene);
			this.camera.attachControl()

			// 光生成
			const light = new HemisphericLight("light", Vector3.Up(), this.scene);
			
			light.intensity = 0.5

			// 初期化されたエンジンを通じシーンをレンダリング
			this.engine.runRenderLoop(() => {
				this.scene.render()
			})
		}
		// 既に作られたシーンの上で作動できているのなら
		else {
			const root = arg as ChildrenScene
			this.engine = root.engine;
			this.scene = root.scene;
			this.camera = root.camera
		}
	}

	/**
	 * @description 新しいシーンを生成してくれる関数
	 * @returns  {Scene} 該当シーン
	 */
	createScene(): Scene {
		const scene = new Scene(this.engine);
		return scene;
	}
}