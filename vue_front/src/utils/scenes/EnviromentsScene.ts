import {Mesh,  PhysicsImpostor ,StandardMaterial, Vector3, VertexData } from "@babylonjs/core";
import { IBasicScene } from "../../types/scene.type";
import BasicScene from "./BasicScene";
import Room from "../../types/room.type";

/**
 *  部屋とか本棚とかなどの環境を調節するクラス
 * @extends {BasicScene<T>}
 */
export default class EnviromentsScene<T extends IBasicScene> extends BasicScene<T>{
	meshes : Array<Mesh> = []
	/**
	 * 数字のArrayを使ってy値が0な3次元Vectorを作る
	 * @param data 長さ2の数字Array
	 * @returns y値が0な3次元Vector
	 */
	public createCorner(data: Array<number>): Room.Corner {
		return new Vector3(data[0], 0, data[1])
	}

	/**
	 * 壁情報を生成する
	 * @param corner 壁のスタートポイントのVector情報
	 */
	public createWall(corner: Vector3): Room.Wall{
		return {corner}
	}

	/**
	 *  壁オブジェクトを作る
	 * @param innerBases 内側の壁座標情報
	 * @param outerBases 外側の壁座標情報
	 * @param options 
	 */
	public buildWall(innerBases: Array<Room.Wall>, outerBases: Array<Room.Wall>, options: Room.Options): Mesh  {
		// 壁の各位置座標を込めるArray
		const positions: Array<number> = []
		// 壁の各座標をどのように繋げるかを定義するArray
		const indices: Array<number> = []

		// 壁情報からx,y,z値を抽出して座標Arrayに入れる
		const extractCorner = (wall: Room.Wall) => {
			const { x, y, z } = wall.corner
			positions.push(x,y,z)
		}
		// base
		innerBases.forEach(extractCorner)
		outerBases.forEach(extractCorner)
		// top
		let currentLength = positions.length;
		for (let i = 0; i < currentLength / 3; i++){
			positions.push(positions[i * 3], options.height, positions[i * 3 + 2]);
		}

		// 座標を繋ぐ順番定義
		indices.push(0, 1, 3, 0, 3, 2) // inner Base
		indices.push(4, 5, 7, 4, 7, 6) // outer Base
		indices.push(0, 1, 5, 0, 5, 4) // inner Top
		indices.push(2, 3, 7, 2, 7, 6) // outer Top

		// 収集した情報を基に計算する
		const normals: any = [];
		const uvs : any = []
		VertexData.ComputeNormals(positions, indices, normals);
		VertexData._ComputeSides(Mesh.BACKSIDE, positions, indices, normals, uvs)

		// 計算した値を基にSCENE上にレンダリングする
		const wallMesh = new Mesh("wall" + options?.meshName, this.scene);
		const vertexData = new VertexData();
		vertexData.positions = positions;
		vertexData.indices = indices;
		vertexData.normals = normals;
		vertexData.uvs = uvs;
		vertexData.applyToMesh(wallMesh)
		// wallMesh.physicsImpostor = new PhysicsImpostor(wallMesh, PhysicsImpostor.BoxImpostor)
		const material = new StandardMaterial("boxMaterial", this.scene);
		material.alpha = 1
		wallMesh.material = material
		const imposter = new PhysicsImpostor(wallMesh, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, this.scene)
		imposter.setDeltaPosition(wallMesh.position)
		wallMesh.physicsImpostor = imposter
		return wallMesh;
	}

	/**
	 *  壁情報を利用し、家を建てる
	 * @param walls 壁情報のArray
	 * @param ply 壁の厚さ
	 * @param height 壁の高さ
	 */
	buildHouse(walls: Array<Room.Wall>, ply: number, height: number) {
		//壁の外側の座標Array
		const outerData : Array<Room.Wall> = [];
		let angle = 0;
		let direction = 0;

		
		let line = Vector3.Zero();
		walls[1].corner.subtractToRef(walls[0].corner, line);
		let nextLine = Vector3.Zero();
		walls[2].corner.subtractToRef(walls[1].corner, nextLine)
		
		const nbWalls = walls.length

		// 壁の外側座標情報を計算
		for (let w = 0; w <= nbWalls; w++) {
			angle = Math.acos(Vector3.Dot(line, nextLine) / line.length() * nextLine.length())
			direction = Vector3.Cross(nextLine, line).normalize().y;

			const lineNormal = new Vector3(line.z, 0, -1 * line.x).normalize();

			line.normalize();
			outerData[(w + 1) % nbWalls] = {corner : walls[(w + 1) % nbWalls].corner.add(lineNormal.scale(ply)).add(line.scale(direction * ply / Math.tan(angle / 2)))};	
			line = nextLine.clone();		
			walls[(w + 3) % nbWalls].corner.subtractToRef(walls[(w + 2) % nbWalls].corner, nextLine);	
		}

		const house = new Mesh("house", this.scene);

		// 座標情報を基に壁生成
		for (let i = 0; i < nbWalls; i++){
			const innerBase = [walls[i], walls[i + 1 >= nbWalls ? 0 : i + 1]]
			const outerBase = [outerData[i], outerData[i + 1 >= nbWalls ? 0 : i + 1]]
			const wall = this.buildWall(innerBase, outerBase, { height })
			wall.checkCollisions = true;
			this.meshes.push(wall)
			house.addChild(wall);
		}
	}
}