import * as THREE from "three";
import {BaseCharactor} from "../objects/charactors/BaseCharactor";

abstract class Camera {
  _camera: THREE.PerspectiveCamera;

  abstract get camera(): THREE.PerspectiveCamera;
}

class PerspectiveCamera extends Camera {
  _camera: THREE.PerspectiveCamera;
  cameraDistance: number = 3;
  cameraAngle: number = THREE.MathUtils.degToRad(20);
  charactor: BaseCharactor;
  perspective: "thirdPerson" | "firstPerson" | "secondPerson" | null;

  constructor(charactor_: BaseCharactor, aspectRatio: number) {
    super();
    this._camera = new THREE.PerspectiveCamera(
      75,
      aspectRatio,
      0.1,
      1000
    );
    this.charactor = charactor_;
    this.charactor.mesh.add(this._camera);
    this.thirdPersonPerspective();
    //this._camera.position.set(0, 0, 0);
  }

  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  thirdPersonPerspective() {
    let cameraX = 0;
    let cameraY = 1;
    let cameraZ = this.cameraDistance ;
    this._camera.position.set(cameraX, cameraY, -cameraZ);
    this._camera.lookAt(this.charactor.mesh.position);
    this._camera.up.set(0, 0, 1);
    //this._camera.rotation.z = 0;
    this.perspective = "thirdPerson";
  }

  firstPersonPerspective() {
    let cameraX = 0;
    let cameraY = 1;
    let cameraZ = this.cameraDistance ;
    this._camera.position.set(cameraX, cameraY, -cameraZ);
    this._camera.lookAt(this.charactor.mesh.position);
    this._camera.position.set(0, 0.7, -0.9);
    this._camera.up.set(0, 0, 1);
    this._camera.rotation.z = 0;
    this.perspective = "firstPerson";
  }

  secondPersonPerspective() {
    let cameraX = 0;
    let cameraY = 1;
    let cameraZ = this.cameraDistance;
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.lookAt(this.charactor.mesh.position);
    this._camera.up.set(0, 1, 0); // 设置上方向为 Y 轴向上

    // 调整相机的旋转角度，确保视角不颠倒
    this._camera.rotation.z = 0;

    this.perspective = "secondPerson";
}
}

export { Camera, PerspectiveCamera };
