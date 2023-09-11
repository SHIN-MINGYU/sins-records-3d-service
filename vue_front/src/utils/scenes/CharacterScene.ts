import {  AnimationGroup,    ISceneLoaderAsyncResult, Matrix, Mesh, MeshBuilder, Observable,   PhysicsImpostor, Quaternion, Ray, RayHelper, Tools, TransformNode, UniversalCamera,  Vector3 } from "@babylonjs/core";
import { IBasicScene } from "../../types/scene.type";
import BasicScene from "./BasicScene";
import PlayerInputController from "../controller/PlayerInputController";

/**
 *  キャラクターに関するシーンに関するクラス
 * @extends {BasicScene<T>}
 */
export default class CharacterScene<T extends IBasicScene> extends BasicScene<T>{
	/**
	 *  ユーザー自分自身のキャラクター情報
	 */
	player: ISceneLoaderAsyncResult;

	// ユーザーのcollisionsボックス
	public mesh : Mesh
	/**
	 *  ユーザーの動作情報
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
	private _prevAni: AnimationGroup
	
	// Observer 
	public onRun = new Observable();



	// ユーザー動作変数
	/**
	 *  秒単位のdeltaTime
	 */
	private _deltaTime: number = 0;
	private _h: number;
	private _v: number;

	private _ray: Ray;


	private _moveDirection: Vector3 = new Vector3();
	private _inputAmt: number;

	private static readonly CAMERA_SPEED : number = Math.PI/90
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
		this._detectCharacterHide()

	}

	/**
	 *  基本キャラクターを作る関数
	 */
	async createCharacter() {
		const character = await this.loadModel("character.glb");
		// キャラクターのcollisionを作る
		const characterCol = MeshBuilder.CreateBox("characterCol", { width: 2, height: 3.8, depth: 2 })
		characterCol.position.y = 1.9
		characterCol.visibility = 0.25
		characterCol.physicsImpostor = new PhysicsImpostor(characterCol, PhysicsImpostor.BoxImpostor,  { mass: 0, restitution:0.75 },this.scene)
		character.meshes.forEach(m => {
			// 作ったcoliisionをキャラクターメッシュの親として指定し、物理法則を適応する
			m.setParent(characterCol)
		})
		this.mesh = characterCol
		this.mesh.checkCollisions = true
		return character
	}

	/**
	 *  基のカメラを削除し、ユーザーの方を追いつきながら移すカメラを生成
	 */
	private _setupPlayerCamera(): UniversalCamera {
		// 既存のカメラを削除
		this.camera.dispose()

		// フレイやをついていくカメラのポジションを制御するためのルートカメラの親
		this._camRoot = new TransformNode("root");
		this._camRoot.position = new Vector3(0, 0, 0);

		this._camRoot.rotation = new Vector3(0, 0, 0);

		// x座標をしたがって回転
		this._yTilt = new TransformNode("ytilt");
		
		// フレイやを見下ろすようにカメラビュー調節
		this._yTilt.rotation = CharacterScene.ORIGINAL_TILT;
		this._yTilt.parent = this._camRoot;

		
		// ルートの位置を示している実質的なカメラ
		this.camera = new UniversalCamera("cam", new Vector3(0,0, -20), this.scene);
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
		this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * CharacterScene.PLAYER_SPEED)

		// プレイやモデルの回転が必要かどうか確認
		let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis);
		if (input.length() === 0) { // 動きが確認できていない場合、動きと回転を止める。
			return;
		}
		
		// 二つの線形保管の間の角度
		let angle = Math.atan2(this._input.horizontalAxis, this._input.verticalAxis) 
		angle += this._camRoot.rotation.y;
		let targ = Quaternion.FromEulerAngles(0, angle, 0); 
		this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion!, targ, 10 * this._deltaTime);
	}
	/**
	 *  アニメションをセットする関数
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
	 *  フレイヤの入力値によったアニメションを決める関数
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
	 *  gravityによってフレイヤの動作をシーン内に繁栄してくれる関数
	 */
	private _updateGroundDetection(): void {
		this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
		this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));
	}

	/**
	 *  カメラの位置をアップデートする
	 */
	private _updateCamera(): void {
		let centerPlayer = this.mesh.position.y + 2;
		this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4)
		this._camRoot.rotation = this._camRoot.rotation.add(new Vector3(this._input.verticalCam, this._input.horizontalCam, 0).scale(CharacterScene.CAMERA_SPEED))
	}

	private _getCameraDirection(origin : Vector3) : Vector3 {
		const initialPosition = new Vector3(0, -10,14 );
		// 회전 각도 설정 (단위: 라디안)
		const a = Tools.ToRadians(this._camRoot.rotation.x *180/Math.PI);
		const b = Tools.ToRadians(this._camRoot.rotation.y *180/Math.PI);
		const c = Tools.ToRadians(this._camRoot.rotation.z *180/Math.PI);

		// 회전 변환 생성
		const rotationMatrix = Matrix.RotationYawPitchRoll(b, a, c);

		// 회전 변환 적용
		const rotatedPosition = Vector3.TransformCoordinates(initialPosition, rotationMatrix);

		const camPosition = origin.add(rotatedPosition);
		const direction = origin.subtract(camPosition).normalize();
		return direction
	}

	private _castRay(): void{
		const playerPosition = this.mesh.position;
		const direction = this._getCameraDirection(playerPosition)
		this._ray = new Ray(playerPosition, direction)

		// const hit = this.scene.pickWithRay(this._ray);

	// 	if (hit!.pickedMesh) {
	// 	console.log(hit!.pickedMesh.name)
	// 	// 캐릭터가 벽에 가려진 상태
	// 	console.log("가려짐")
	// } else {
	// 	// 벽에 가려진 상태가 아님
	// 	console.log("안가려짐")
	// 		}
	}


	rayHelper: RayHelper;
	private _detectCharacterHide(): void {
		
		this._castRay()
		this.rayHelper = new RayHelper(this._ray);	
		this.rayHelper.show(this.scene);
	}

	private _updateRayHelper() {
		this.rayHelper.ray = this._ray;
	}
	/**
	 *  レンダリングされる前に変更が入らなければならない関数の集まり
	 */
	private _beforeRenderUpdate(): void {
		this._updateFromControl();
		this._updateGroundDetection();
		this._castRay()
		this._updateRayHelper()
		this._animatePlayer();
	}

	/**
	 *  フレイヤを基準にするカメラを生成する
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