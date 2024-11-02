import * as THREE from "three";

abstract class Camera {
  _camera: THREE.PerspectiveCamera;

  abstract get camera(): THREE.PerspectiveCamera;
}

class PerspectiveCamera extends Camera {
  _camera: THREE.PerspectiveCamera;

  constructor(aspectRatio: number) {
    super();
    this._camera = new THREE.PerspectiveCamera(
      75,
      aspectRatio,
      0.1,
      1000
    );
    this._camera.position.set(0, 1, 5);
  }

  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }
}

export { Camera, PerspectiveCamera };
