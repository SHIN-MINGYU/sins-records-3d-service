import { Engine, Scene, FreeCamera, Vector3, MeshBuilder, StandardMaterial, Color3, HemisphericLight } from "@babylonjs/core";

// 캔버스위에 Scene을 만드는 함수
const createScene = (canvas : HTMLCanvasElement) => {
    const engine = new Engine(canvas);
	const scene = new Scene(engine);
	
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    new HemisphericLight("light", Vector3.Up(), scene);
 
   
  const boxRed = MeshBuilder.CreateBox("box-red", { size: 1 }, scene);
  const materialRed = new StandardMaterial("box-red-material", scene);
  materialRed.diffuseColor = Color3.Red();
  boxRed.material = materialRed;
  boxRed.position.x = -2;

  const boxBlue = MeshBuilder.CreateBox("box-yellow", { size: 1 }, scene);
  const materialYellow = new StandardMaterial("box-blue-material", scene);
  materialYellow.diffuseColor = Color3.Yellow();
  boxBlue.material = materialYellow;

  const boxGreen = MeshBuilder.CreateBox("box-green", { size: 1 }, scene);
  const materialGreen = new StandardMaterial("box-green-material", scene);
  materialGreen.diffuseColor = Color3.Green();
  boxGreen.material = materialGreen;
  boxGreen.position.x = 2;

	// 엔진을 기반으로
	engine.runRenderLoop(() => {
	  // scene을 렌더링
		scene.render();
		boxGreen.rotation.y += 0.01;
  });
};

export { createScene };