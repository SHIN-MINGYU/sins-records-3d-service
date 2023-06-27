import { FollowCamera, ISceneLoaderAsyncResult, KeyboardEventTypes, KeyboardInfo, Vector3 } from "@babylonjs/core";
import { IBasicScene } from "../../types/scene.type";
import BasicScene from "./BasicScene";

/**
 * @description キャラクターに関するシーンに関するクラス
 * @extends {BasicScene<T>}
 */
export default class CharacterScene<T extends IBasicScene> extends BasicScene<T>{
	/**
	 * @description ユーザー自分自身のキャラクター情報
	 */
	player ?: ISceneLoaderAsyncResult

	/**
	 * @description 基本キャラクターを作る関数
	 */
	async createCharacter() {
		this.player = await this.loadModel("character.glb"); 
	}

	/**
	 * @description 基のカメラを削除し、ユーザーの方を追いつきながら移すカメラを生成
	 */
	attatchCameraToCharacter() {
		// 既存のカメラを錯書
		this.camera.dispose();

		// 新しいカメラに引き換える
		this.camera = new FollowCamera("UserFollowCam", new Vector3(0, 10, -10), this.scene);
		
		// 既存カメラタイプが親カメラタイプのため、新しい変数に込めることでタイプを加枝てオプション値を調節
		const cam = this.camera as FollowCamera;

		cam.radius = 30;
		cam.heightOffset = 10;
		cam.rotationOffset = 0;
		cam.cameraAcceleration = 0.005;
		cam.maxCameraSpeed = 1000;

		// カメラが眺める対象を指定
		cam.lockedTarget =this.player!.meshes[0]
	}

	/**
	 * @description キャラクターの動きイベントを追加
	 * @해야되는것 1. 유저마다 움직임 이벤트 추가, 모든 키 대응
	 */
	addMoveEventListener() {
		// イベントハンドラを作成
		const moveEventHandler = (e: KeyboardInfo) => {
			const keyDownHandler = (key: string) => {
				switch (key) {
					case "ArrowDown":
						if (!this.player?.animationGroups[1].isPlaying) {
							this.player?.animationGroups[1].play()
						}				}
			}

			const keyUpHandler = (key : string) => {
				switch (key) {
					case "ArrowDown":
						if (this.player?.animationGroups[1].isPlaying) {
							this.player?.animationGroups[1].stop()
						}
				}
			}
			switch (e.type) {
				case KeyboardEventTypes.KEYDOWN:
					keyDownHandler(e.event.key)
					break;
				case KeyboardEventTypes.KEYUP:
					keyUpHandler(e.event.key)
					break;
			}
		}

		// イベントハンドラ登録
		this.scene.onKeyboardObservable.add(moveEventHandler)
	}
}