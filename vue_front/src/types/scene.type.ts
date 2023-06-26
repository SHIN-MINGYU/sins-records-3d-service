import BasicScene from "../utils/BasicScene"

export type ParentScene = HTMLCanvasElement

export type ChildrenScene = BasicScene<ChildrenScene>;

export type IBasicScene = ParentScene | ChildrenScene


export function isTypeParentScene(param: IBasicScene): param is ParentScene {
	return true;
}

export function isTypeChildrenScene(param: IBasicScene): param is ChildrenScene {
	return true;
}