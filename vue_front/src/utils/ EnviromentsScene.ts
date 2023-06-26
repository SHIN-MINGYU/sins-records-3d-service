import { MeshBuilder } from "@babylonjs/core";
import { IBasicScene } from "../types/scene.type";
import BasicScene from "./BasicScene";

export default class EnviromentsScene<T extends IBasicScene> extends BasicScene<T>{
	createGround() {
		const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, this.scene)
		return ground;
	}
}