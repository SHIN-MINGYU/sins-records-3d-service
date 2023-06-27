import { ActionManager, Scene } from "@babylonjs/core";

export default class PlayerInputController{
	constructor(private _scene: Scene) {
		
		// ユーザーのインプットを検知するActionManager生成
		this._scene.actionManager = new ActionManager(this._scene);
	}
}