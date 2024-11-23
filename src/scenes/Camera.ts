import * as THREE from "three";
import { BaseCharacter } from "../objects/characters/BaseCharacter";

abstract class Camera {
  _camera: THREE.PerspectiveCamera;

  abstract get camera(): THREE.PerspectiveCamera;
}

class PerspectiveCamera extends Camera {
  _camera: THREE.PerspectiveCamera;
  cameraDistance: number = 4;
  cameraAngle: number = THREE.MathUtils.degToRad(20);
  character: BaseCharacter;
  perspective: "thirdPerson" | "firstPerson" | "secondPerson" | null;
  _isCustomCamera: boolean = true;
  isShaking: boolean = false;

  constructor(character_: BaseCharacter, aspectRatio: number = window.innerWidth / window.innerHeight, 
    fov: number = 75, far: number = 1000) {
    super();
    this._camera = new THREE.PerspectiveCamera(
      fov, // 视场角
      aspectRatio,
      0.1,
      far // 可见距离
    );
    this.character = character_;
    this.thirdPersonPerspective();
    
  }

  get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  thirdPersonPerspective() {
    let cameraX = this.character.mesh.position.x;
    let cameraY = this.character.mesh.position.y + this.cameraDistance;
    let cameraZ = this.character.mesh.position.z - this.cameraDistance;
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.lookAt(new THREE.Vector3(this.character.mesh.position.x, 
      this.character.mesh.position.y, this.character.mesh.position.z+this.cameraDistance));
    this._camera.up.set(0, 1, 0);
    this.perspective = "thirdPerson";
  }
  firstPersonPerspective() {
    let cameraX = this.character.mesh.position.x;
    let cameraY = this.character.mesh.position.y + this.cameraDistance;
    let cameraZ = this.character.mesh.position.z - this.cameraDistance;
    this._camera.position.set(cameraX, cameraY, -cameraZ);
    this._camera.lookAt(this.character.mesh.position);
    this._camera.up.set(0, 1, 0);
    this.perspective = "firstPerson";
  }

  secondPersonPerspective() {
    let cameraX = this.character.mesh.position.x;
    let cameraY = this.character.mesh.position.y + this.cameraDistance;
    let cameraZ = this.character.mesh.position.z - this.cameraDistance;
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.lookAt(this.character.mesh.position);
    this._camera.up.set(0, 1, 0); // 设置上方向为 Y 轴向上

    // 调整相机的旋转角度，确保视角不颠倒
    this._camera.rotation.z = 0;

    this.perspective = "secondPerson";
  }

  update() {
    if (this.isShaking) return;
    // 根据当前的视角重新设置相机的位置和方向
    switch (this.perspective) {
      case "thirdPerson":
        this.thirdPersonPerspective();
        break;
      case "firstPerson":
        this.firstPersonPerspective();
        break;
      case "secondPerson":
        this.secondPersonPerspective();
        break;
      default:
        this.thirdPersonPerspective();
        break;
    }
  }

  shake(intensity: number, duration: number) {
    this.isShaking = true;
    const originalPosition = this._camera.position.clone();
    const shakeInterval = setInterval(() => {
      this._camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
      this._camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
      this._camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
    }, 1000 / 60);

    setTimeout(() => {
      clearInterval(shakeInterval);
      this._camera.position.copy(originalPosition);
      this.isShaking = false;
    }, duration);
  }
}

export { Camera, PerspectiveCamera };