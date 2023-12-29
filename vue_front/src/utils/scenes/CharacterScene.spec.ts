import {createMockScene} from '../../__mock__/BasicScene.mock';
import BasicScene from './BasicScene';
import CharacterScene from './CharacterScene';
import PlayerInputController from '../controller/PlayerInputController';
import { Scalar } from '@babylonjs/core';
jest.mock("../controller/PlayerInputController")


describe("Character Scene (Unit Test)", () => {
	// Define util function before test
	let characterScene : any

	function go(direction: "vertical" | "horizontal", speed: number): void {
		characterScene._input[`${direction}` + "Axis"] =speed;
		characterScene._input[`${direction}`] =Scalar.Lerp(0, speed, 0.2)
	}

	function  stop(direction: "vertical" | "horizontal") : void {
		characterScene._input[`${direction}` + "Axis"] = 0;
		characterScene._input[`${direction}`] = 0;
	}
	const MoveEventObj : {[key : string] : ()=>void} = {
		"ArrowUp":()=> go("vertical", 1),
		"ArrowDown": ()=>go("vertical", -1),
		"ArrowLeft": ()=>go("horizontal", -1),
		"ArrowRight": () => go("horizontal", 1),
	}
	
	const keys = Object.keys(MoveEventObj)
	
	keys.forEach((key, idx) => {
		if (idx < 2) {
			[2, 3].forEach((v) => {
				MoveEventObj[[key, keys[v]].join("&")] = () => {
					MoveEventObj[key]()
					MoveEventObj[keys[v]]()
				}
			})
		}
	})


	// Test Start
	beforeEach(async () => {
		jest.clearAllMocks()
		const mockScene = createMockScene()
		const basicScene = new BasicScene(mockScene)
		characterScene = await CharacterScene.createCharacter(basicScene)
		stop("vertical")
		stop("horizontal")
	});




	describe("Character Event (Move)", () => {
		test("PlayerInputController is called?", () => {
			expect(PlayerInputController).toBeCalledTimes(1)
		})

		Object.keys(MoveEventObj).forEach(key => {
			test(`${key} Move`, () => {		

				const originPosition = { ...CharacterScene.mesh.position }
				MoveEventObj[key]()
	
				characterScene._beforeRenderUpdate()
		
				key.includes("Up") && expect(CharacterScene.mesh.position._z > originPosition._z).toBeTruthy()
				key.includes("Down") && expect(CharacterScene.mesh.position._z < originPosition._z).toBeTruthy()
				key.includes("Left") && expect(CharacterScene.mesh.position._x < originPosition._x).toBeTruthy()
				key.includes("Right") && expect(CharacterScene.mesh.position._x > originPosition._x).toBeTruthy()

				stop("vertical")
				stop("horizontal")
			})
		})
		
	})

})