import * as THREE from "three";
import { Scene } from "./Scene";
import { PerspectiveCamera } from "./Camera";

class Renderer {
  renderer: THREE.WebGLRenderer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  render(scene: Scene, camera: PerspectiveCamera) {
    this.renderer.render(scene.scene, camera.camera);
  }
}

export { Renderer };