import { Camera, Engine, FreeCamera, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { ChildrenScene, ParentScene, IBasicScene,  isTypeParentScene } from "../types/scene.type";

/**
 * @description 모든 장면 생성에 대한 공통적인 부분을 모아 놓은 클래스이다.
 */
export default class BasicScene<T extends IBasicScene> {
	scene: Scene;
	engine: Engine;
	camera: Camera;

	constructor(arg: T) {
		// 만약 해당 장면이 최초로 생성되는 장면이라면
		if (isTypeParentScene(arg)) {
			const canvas = arg
			// 엔진 초기화
			// 첫번째 인자는 장면이 들어갈 canvas 엘리멘트
			// 두번째 인자는 해상도 조절 기술 중 하나인 antialias 기술을 적용할지 안할지에 대한 bool값이다.
			this.engine = new Engine(canvas as ParentScene, true)

			// 장면 초기화
			this.scene = this.createScene();

			// 카메라 초기화(임시 코드)
			this.camera = new FreeCamera("testCamera", new Vector3(0, 1, 0), this.scene);
			this.camera.attachControl()

			const light = new HemisphericLight("light", Vector3.Up(), this.scene);
			
			light.intensity = 0.5

			// 초기화된 엔진을 통해서 장면을 렌더링 시키는 함수
			this.engine.runRenderLoop(() => {
				this.scene.render()
			})
		}
		// 이미 생성된 장면 위에서 작동하는 것이라면
		else {
			const root = arg as ChildrenScene
			this.engine = root.engine;
			this.scene = root.scene;
			this.camera = root.camera
		}
	}

	/**
	 * @description 새로운 장면을 생성해주는 함수이다.
	 * @returns  {Scene} 장면에 대한 반환
	 */
	createScene(): Scene {
		const scene = new Scene(this.engine);
		return scene;
	}
}