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
  isClosingup: boolean = false;

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
      this.character.mesh.position.y, this.character.mesh.position.z + this.cameraDistance));
    this._camera.up.set(0, 1, 0);
    this.perspective = "thirdPerson";
  }

  firstPersonPerspective() {
    let cameraX = this.character.mesh.position.x;
    let cameraY = this.character.mesh.position.y + this.cameraDistance;
    let cameraZ = this.character.mesh.position.z;
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.lookAt(new THREE.Vector3(this.character.mesh.position.x, 
      this.character.mesh.position.y, this.character.mesh.position.z + this.cameraDistance));
    this._camera.up.set(0, 1, 0);
    this.perspective = "firstPerson";
  }

  secondPersonPerspective() {
    let cameraX = this.character.mesh.position.x + this.cameraDistance;
    let cameraY = this.character.mesh.position.y + this.cameraDistance;
    let cameraZ = this.character.mesh.position.z + this.cameraDistance;
    this._camera.position.set(cameraX, cameraY, cameraZ);
    this._camera.lookAt(this.character.mesh.position);
    this._camera.up.set(0, 1, 0); // 设置上方向为 Y 轴向上
    this.perspective = "secondPerson";
  }

  async closeUp() {
    this.isClosingup = true;
    const originalPosition = this._camera.position.clone();
    const originalFov = this._camera.fov;
    const targetPosition = new THREE.Vector3(
      this.character.mesh.position.x,
      this.character.mesh.position.y + 2,
      this.character.mesh.position.z + 3.5 // 贴近角色
    );

    // 移动到特写位置并调整视场角
    await this.animateCameraPositionAndFov(targetPosition, 50, 200);

    // 停留一秒
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 移动回原位并恢复视场角
    await this.animateCameraPositionAndFov(originalPosition, originalFov, 200);
    this.isClosingup = false;
  }

  animateCameraPositionAndFov(targetPosition: THREE.Vector3, targetFov: number, duration: number) {
    return new Promise<void>((resolve) => {
      const startPosition = this._camera.position.clone();
      const startFov = this._camera.fov;
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        this._camera.position.lerpVectors(startPosition, targetPosition, t);
        this._camera.fov = startFov + (targetFov - startFov) * t;
        this._camera.updateProjectionMatrix();
        this._camera.lookAt(this.character.mesh.position);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  update() {
    if (this.isShaking || this.isClosingup) return;
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