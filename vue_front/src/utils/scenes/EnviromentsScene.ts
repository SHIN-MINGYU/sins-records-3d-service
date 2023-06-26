import { MeshBuilder, Vector3 } from "@babylonjs/core";
import { IBasicScene } from "../../types/scene.type";
import BasicScene from "./BasicScene";

/**
 * @description 部屋とか本棚とかなどの環境を調節するクラス
 */
export default class EnviromentsScene<T extends IBasicScene> extends BasicScene<T>{
	createGround() {
		const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, this.scene)
		return ground;
	}

	createBall() {
		const ball = MeshBuilder.CreateSphere("Ball", { diameter: 1 }, this.scene);
		ball.position = new Vector3(1,1,1)
		return ball;
	}
}