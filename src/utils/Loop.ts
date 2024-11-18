import { Clock } from "three";
import { Camera } from "../scenes/Camera";
import { Renderer } from "../scenes/Renderer";
import { Scene } from "../scenes/Scene";
import { checkCollision, checkCollisionMesh } from './Collision';

class Loop {
  scene: Scene;
  camera: Camera;
  renderer: Renderer;
  clock: Clock;
  /// list of lists of updateables
  updatableLists: any[];

  constructor(scene: Scene, camera: Camera, renderer: Renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.clock = new Clock();
    this.updatableLists = [];
  }


  start() {
    const renderer = this.renderer;
    const camera = this.camera;
    renderer.renderer.setAnimationLoop(() => {
      this.tick();
      renderer.renderer.render(this.scene.scene, camera.camera);
    });
    this.clock.getDelta();
  }

  tick() {
    //console.log('loop ticking');
    const delta = this.clock.getDelta();
    this.updatableLists.forEach(updatableList => { updatableList.forEach(updatable => updatable.tick(delta)) });
  }

  stop() {
    this.renderer.renderer.setAnimationLoop(null);
  }
}

export { Loop };
