import BasicScene from "../utils/scenes/BasicScene"

/**
 * @description 初めて、つまり、親シーンを生成する時にコンストラクタの板引数のタイプ
 */
export type ParentScene = HTMLCanvasElement

/**
 * @description 作られたシーンの上でコンストラクタを呼び出すときの仮引数のタイプ
 */
export type ChildrenScene = BasicScene<ChildrenScene>;


/**
 * @description 全てのシーンにおいてコンストラクタの仮引数タイプ
 */
export type IBasicScene = ParentScene | ChildrenScene


export function isTypeParentScene(param: IBasicScene): param is ParentScene {
	return true;
}

export function isTypeChildrenScene(param: IBasicScene): param is ChildrenScene {
	return true;
}