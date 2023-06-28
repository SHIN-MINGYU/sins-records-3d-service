import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";


/**
 * @description 
 */
export default class PlayerInputController {
	[key: string]: any

	/**
	 * @description 入力されたキーをBooleanとして判明するためのオブジェクト
	 */
	public inputMap: {[key : string] : boolean};

	/**
	 * @description 左右動きの速度
	 */
	public horizontal: number = 0;

	/**
	 * @description: 上下動きの速度
	 */
	public vertical: number = 0;

	/**
	 * @description 左右の動きがあるか否かを確かめるための変数
	 */
	public horizontalAxis: number = 0;

	/**
	 * @description 上下動きがあるか否かを確かめるための変数
	 */
	public verticalAxis: number = 0;

	constructor(private _scene: Scene) {
		// ユーザーのインプットを検知するActionManager生成
		this._scene.actionManager = new ActionManager(this._scene);

		this.inputMap = {}

		// キーを押す時、そのキーの値をtrueの値を持つキーとしてオブジェクトの中に入れ込む
		this, _scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (e) => {
			this.inputMap[e.sourceEvent.key] = e.sourceEvent.type == "keydown";
		}))

		//キーから指が離れる時、そのキーの値をfalseに変える
		this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (e) => {
			this.inputMap[e.sourceEvent.key] = e.sourceEvent.type == "keydown";
		}));

		this._scene.onBeforeRenderObservable.add(() => {
			this._updateFromKeyboard()
		})
	}

	/**
	 * @description キーが押された時の動作定義関数
	 */
	private _updateFromKeyboard(): void {
		if (this.inputMap["ArrowUp"]) this.go("vertical",1)
	    else if (this.inputMap["ArrowDown"]) this.go("vertical",-1)
		else this.stop("vertical")

		if (this.inputMap["ArrowLeft"]) this.go("horizontal",-1)
		else if (this.inputMap["ArrowRight"]) this.go("horizontal",1)
		else this.stop("horizontal")
	}

	/**
	 * @description 動きを定義する関数
	 * @param direction 動き方向
	 * @param speed 速度 
	 */
	private go(direction: "vertical" | "horizontal", speed: number): void {
		this[`${direction}` + "Axis"] =speed;
		this[`${direction}`] =Scalar.Lerp(this[`${direction}`], speed, 0.2)
	}

	private stop(direction: "vertical" | "horizontal") : void {
		this[`${direction}` + "Axis"] = 0;
		this[`${direction}`] = 0;
	}
}