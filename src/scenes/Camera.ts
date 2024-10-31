import * as THREE from "three";

abstract class Camera {
  _camera: THREE.PerspectiveCamera;

  abstract get camera(): THREE.PerspectiveCamera;
}


class PerspectiveCamera extends Camera {
  cameraDistance: number = 300;
  cameraAngle: number = THREE.MathUtils.degToRad(50);

  constructor(aspect: number) {
    super();
    this._camera = new THREE.PerspectiveCamera(
      75,
      aspect,
      0.1,
      1000
    );
    // add camera to the tank's local coordinate frame
    let cameraX = 0;
    let cameraY = -this.cameraDistance * Math.cos(this.cameraAngle);
    let cameraZ = this.cameraDistance * Math.sin(this.cameraAngle);
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.up.set(0, 0, 1);
  }

  get camera() {
    return this._camera;
  }
}

export { Camera, PerspectiveCamera };
