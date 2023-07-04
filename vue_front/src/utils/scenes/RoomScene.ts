import { Color4, Vector3, Vector4 } from "@babylonjs/core";

import BasicScene from "./BasicScene";

import type { IBasicScene } from "../../types/scene.type";
import type Room  from "../../types/room.type";




export default class RoomScene<T extends IBasicScene> extends BasicScene<T> {
	private _walls : Array<Room.Wall> = []
	private _position = []
	private _indices = []
	private _uvs = []
	private _colors = []
	private _options: Partial<Room.Options>
	private corners : Room.Corners  = {
		innerBase: [],
		outerBase: [],
		innerTop: [],
		outerTop: [],
		innerDoor: [],
		outerDoor: [],
		innerWindow: [],
		outerWindow:[]
	}

	// Constants
	private static readonly DEFAULT_UV: Vector4 = new Vector4(0, 0, 1, 1)
	private static readonly DEFAULT_COLOR: Color4 = new Color4(1, 1, 1, 1);
	
	constructor(arg: T, options: Partial<Room.Options>) {
		super(arg)
		// 基本オプション
		const defaultOprions: Room.Options = {
			interior: false,
			interiorUV: new Vector4(0,0,1,1),
			exteriorUV: new Vector4(0,0,1,1),
			interiorColor: new Color4(1,1,1,1),
			exteriorColor: new Color4(1,1,1,1)
		}
		// 設定初期化
		this._options = { ...defaultOprions, ...options }
	}
	
	public buildFromPlan(walls: Array<Room.Wall>, ply :number)  : void{
		!this._options.interior && walls.push(walls[0]);
		let angle = 0;
		let direction = 0;

		let lineNormal: Vector3;

		let line = Vector3.Zero();
		let nextLine = Vector3.Zero();

		let nbWalls = walls.length;

		if (nbWalls === 2) {
			walls[1].corner.subtractToRef(walls[0].corner, line);
			lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize()
			line.normalize();
			this.corners.innerBase[0] = walls[0].corner;
			this.corners.outerBase[0] = walls[0].corner.add(lineNormal.scale(ply));
			this.corners.innerBase[1] = walls[1].corner;
			this.corners.outerBase[1] = walls[1].corner.add(lineNormal.scale(ply));
		}
		
		else if (nbWalls > 2) {
		
		}
	}

	/**
	 *  壁を作る関数
	 * @param corner 壁のスタートポイントのベクター値(ただし、Yの値は0にならないといけない)
	 * @param doorSpaces  ドアーの空間情報
	 * @param windowSpaces 窓の空間情報
	 * @returns 壁の情報
	 */
	public createWall(corner: Vector3, doorSpaces: Array<Room.DoorSpace> = [], windowSpaces: Array<Room.WindowSpace> = []) : Room.Wall{
		return {
			corner,
			doorSpaces,
			windowSpaces
		}
	}

	/**
	 * 壁の始まりのポイントを指定するコーナーベクターを生成する関数
	 * @param x 
	 * @param z 
	 * @returns 
	 */
	public createCorner(x: number, z: number): Vector3 {
		return new Vector3(x, 0, z);
	}
	
}