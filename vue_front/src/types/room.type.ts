import { Color4,  Vector3, Vector4 } from "@babylonjs/core";

namespace Room {
	export type Corner = Vector3

	/**
	 *  壁を作る時に使われるオプショナル的なプロパティの集まり
	 */
	export interface Options {
		height: number
		meshName? : any
	}

	/**
	 * ドア
	 */
	export interface Door {
		width: number;
		height: number;
	}

	/**
	 * ドアーの位置情報
	 */
	export interface DoorSpace {
		door: Door;
		left: number;
	}

	/**
	 * 窓
	 */
	export interface Window {
		width: number;
		height: number;
	}

	/**
	 * 窓の位置情報
	 */
	export interface WindowSpace {
		window: Window;
		left: number;
		top: number;
	}

	/**
	 * 壁情報
	 */
	export interface Wall {
		corner: Vector3
		doorSpaces?: Array<DoorSpace> | []
		windowSpaces? : Array<WindowSpace> | []
	}


}


export default Room
