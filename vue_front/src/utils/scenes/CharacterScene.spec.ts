import { MeshBuilder } from '@babylonjs/core';
import {createMockScene} from '../../__mock__/BasicScene.mock';
import BasicScene from './BasicScene';
import CharacterScene from './CharacterScene';

describe("Character Scene (Unit Test)", () => {
	let basicScene : BasicScene<any>;
	
	beforeEach(() => {
		jest.resetAllMocks();
		const mockScene = createMockScene()
		basicScene = new BasicScene(mockScene)
	});

	// describe("Character Key Event (Move)", () => {
	// 	it('Init Basic Scene use to mock', () => {
	// 		const characterScene = new CharacterScene(basicScene)
	// 		characterScene.mesh = MeshBuilder.CreateBox("box", { size: 10, width: 10, height: 10 }, characterScene.scene)
	// 		console.log(characterScene.mesh.position)
	// 		const event = new KeyboardEvent('keydown', { key: "ArrowUp" })
	// 		document.dispatchEvent(event)
	// 		console.log(document)
	// 		console.log(characterScene.mesh.position)
			
	// 	})
	// })

})