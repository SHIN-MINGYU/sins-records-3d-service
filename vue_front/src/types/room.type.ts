import { Color4, Vector2, Vector3, Vector4 } from "@babylonjs/core";

namespace Room {
	export interface Corners {
		innerBase: Array<Vector3>,
		outerBase: Array<Vector3>,
		innerTop: Array<Vector3>,
		outerTop: Array<Vector3>,
		innerDoor: Array<Vector3>,
		outerDoor: Array<Vector3>,
		innerWindow: Array<Vector3>,
		outerWindow:Array<Vector3>
	}

	/**
	 * @description 壁を作る時に使われるオプショナル的なプロパティの集まり
	 */
	export interface Options {
		interior : boolean  
		interiorUV: Vector4 
		exteriorUV: Vector4
		interiorColor: Color4
		exteriorColor: Color4
	}

	export interface Door {
		width: number;
		height: number;
	}

	export interface DoorSpace {
		door: Door;
		left: number;
	}

	export interface Window {
		width: number;
		height: number;
	}

	export interface WindowSpace {
		window: Window;
		left: number;
		top: number;
	}

	export interface Wall {
		corner: Vector3
		doorSpaces?: Array<DoorSpace>
		windowSpaces? : Array<WindowSpace>
	}
}


export default Room
