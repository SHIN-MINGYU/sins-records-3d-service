import {createMockScene} from '../../__mock__/BasicScene.mock';
import BasicScene from './BasicScene';

describe("Basic Scene (Unit Test)", () => {
	let basicScene : BasicScene<any>;
	
	beforeEach(() => {
		jest.resetAllMocks();
		const mockScene = createMockScene()
		basicScene = new BasicScene(mockScene)
	});

	it('Init Basic Scene use to mock', () => {
		expect(basicScene).toBeInstanceOf(BasicScene)
	})
})
