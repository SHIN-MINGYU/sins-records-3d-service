import {  AnimationGroup,  ISceneLoaderAsyncResult, Observable, Quaternion, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import { IBasicScene } from "../../types/scene.type";
import BasicScene from "./BasicScene";
import PlayerInputController from "../controller/PlayerInputController";

/**
 * @description キャラクターに関するシーンに関するクラス
 * @extends {BasicScene<T>}
 */
export default class CharacterScene<T extends IBasicScene> extends BasicScene<T>{
	/**
	 * @description ユーザー自分自身のキャラクター情報
	 */
	player: ISceneLoaderAsyncResult;
	
	/**
	 * @description ユーザーの動作情報
	 */
	private _input: PlayerInputController;

	// Camera
	private _camRoot: TransformNode;
	private _yTilt: TransformNode;

	private _gravity: Vector3 = new Vector3();

	// Animation
	private _idle : AnimationGroup;
	private _running : AnimationGroup;
	private _walking: AnimationGroup;
	private _currentAni: AnimationGroup
	private _prevAni : AnimationGroup
	

	// Observer 
	public onRun = new Observable();


	// ユーザー動作変数
	/**
	 * @description 秒単位のdeltaTime
	 */
	private _deltaTime: number = 0;
	private _h: number;
	private _v: number;

	private _moveDirection: Vector3 = new Vector3();
	private _inputAmt: number;
	
	private static readonly PLAYER_SPEED: number = 0.45;
	private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
	
	constructor(arg : T) {
		super(arg)
		this.bootStrap()
	}

	async bootStrap() {
		this.player = await this.createCharacter();

		// カメラ初期化
		this._setupPlayerCamera();
		
		this._input = new PlayerInputController(this.scene);
			
		// アニメション初期化
		this._idle = this.player.animationGroups[0];
		this._running = this.player.animationGroups[1];
		this._walking = this.player.animationGroups[2];

		// アニメション初期化
		this._setAnimation();

		this.activatePlayerCamera()
	}

	/**
	 * @description 基本キャラクターを作る関数
	 */
	async createCharacter() {
		return await this.loadModel("character.glb"); 
	}

	/**
	 * @description 基のカメラを削除し、ユーザーの方を追いつきながら移すカメラを生成
	 */
	private _setupPlayerCamera(): UniversalCamera {
		// 既存のカメラを削除
		this.camera.dispose()

		// フレイやをついていくカメラのポジションを制御するためのルートカメラの親
		this._camRoot = new TransformNode("root");
		this._camRoot.position = new Vector3(0, 0, 0);

		//裏からフレイやを移す(180DEG)
		this._camRoot.rotation = new Vector3(0, Math.PI, 0);

		// x座標をしたがって回転
		this._yTilt = new TransformNode("ytilt");
		
		// フレイやを見下ろすようにカメラビュー調節
		this._yTilt.rotation = CharacterScene.ORIGINAL_TILT;
		this._yTilt.parent = this._camRoot;

		// ルートの位置を示している実質的なカメラ
		this.camera = new UniversalCamera("cam", new Vector3(0, 0, -30), this.scene);
		const cam = this.camera as UniversalCamera;
		cam.lockedTarget = this._camRoot.position;
		cam.fov = 0.47350045992678597;
		cam.parent = this._yTilt;

		this.scene.activeCamera = this.camera;
		return this.camera as UniversalCamera
	}


	private _updateFromControl() {
		// deltaTimeを秒単位に変えて変数に保存
		this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0

		// 動作情報を初期化
		this._moveDirection = Vector3.Zero();
		this._h = this._input.horizontal; // right, x
		this._v = this._input.vertical; // forward, z

		let dashFactor = 1;

		// カメラ動きによる動き定義
		let fwd = this._camRoot.forward;
		let right = this._camRoot.right;
		let correctedVertical = fwd.scaleInPlace(this._v);
		let correctedHorizontal = right.scaleInPlace(this._h);

		// カメラビューとは関係のない動き
		let move = correctedHorizontal.addInPlace(correctedVertical);

		// Yの値を消すことによってフレイヤは飛ばない、また正規化することによって動く方向情報を得る
		this._moveDirection = new Vector3(move.normalize().x * dashFactor, 0, move.normalize().z * dashFactor);

		// 斜めの移動が二倍に早くならないように入力値をとめる
		let inputMag = Math.abs(this._h) + Math.abs(this._v);

		
		if (inputMag < 0) this._inputAmt = 0;
		else if (inputMag > 1) this._inputAmt = 1
		else this._inputAmt = inputMag
		

		// 入力の値を考えた上の動き
		this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * CharacterScene.PLAYER_SPEED);
		
		// プレイやモデルの回転が必要かどうか確認
		let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis);
		if (input.length() === 0) { // 動きが確認できていない場合、動きと回転を止める。
			return;
		}

		// 二つの線形保管の間の角度
		let angle = Math.atan2(this._input.horizontalAxis, this._input.verticalAxis) 

		
		// angle += this._camRoot.rotation.y;


		let targ = Quaternion.FromEulerAngles(0, angle, 0);

		this.player.meshes[0].rotationQuaternion = Quaternion.Slerp(this.player.meshes[0].rotationQuaternion!, targ, 10 * this._deltaTime);
	}
	/**
	 * @description アニメションをセットする関数
	 */
	private _setAnimation(): void {
		this.scene.stopAllAnimations();
		this._running.loopAnimation = true;
		this._walking.loopAnimation = true;
		this._idle.loopAnimation = true;

		this._currentAni = this._idle;
		this._prevAni = this._idle;
	}
	/**
	 * @description フレイヤの入力値によったアニメションを決める関数
	 */
	private _animatePlayer(): void {
		// 方向キーが押されたらアニメションを「歩き」に変える
		if (this._input.inputMap["ArrowUp"] || this._input.inputMap["ArrowDown"] || this._input.inputMap["ArrowRight"] || this._input.inputMap["ArrowLeft"]) {
			this._currentAni = this._walking;
			this.onRun.notifyObservers(true);
		} else {
			// 他の場合は「何もしてない」状態に変える
			this._currentAni = this._idle
		}

		// 直前のアニメションが上のステートメントで変わったアニメションと違ったら
		// 直前のアニメションを止めて変わったアニメションに変える
		if (this._currentAni !== null && this._currentAni !== this._prevAni ) {
			this._prevAni.stop();
			this._currentAni.play(this._currentAni.loopAnimation);
			this._prevAni = this._currentAni
		}
	}

	/**
	 * @description gravityによってフレイヤの動作をシーン内に繁栄してくれる関数
	 */
	private _updateGroundDetection() : void {
		this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
		this.player.meshes[0].moveWithCollisions(this._moveDirection.addInPlace(this._gravity));
	}

	/**
	 * @description カメラの位置をアップデートする
	 */
	private _updateCamera(): void {
		let centerPlayer = this.player.meshes[0].position.y + 2;
		this._camRoot.position  = Vector3.Lerp(this._camRoot.position, new Vector3(this.player.meshes[0].position.x, centerPlayer, this.player.meshes[0].position.z),0.4)
	}

	/**
	 * @description レンダリングされる前に変更が入らなければならない関数の集まり
	 */
	private _beforeRenderUpdate(): void {
		this._updateFromControl();
		this._updateGroundDetection();
		this._animatePlayer();
	}

	/**
	 * @description フレイヤを基準にするカメラを生成する
	 * @returns 
	 */
	public activatePlayerCamera(): UniversalCamera {
		this.scene.registerBeforeRender(() => {
			this._beforeRenderUpdate()
			this._updateCamera()
		})
		return this.camera as UniversalCamera
	}
}