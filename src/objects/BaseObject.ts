import * as THREE from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

abstract class BaseObject {
  type: string;
  name: string;
  mesh: THREE.Object3D;

  constructor(type: string, name: string) {
    this.type = type;
    this.name = name;
  }

  destruct() {
    this.mesh.parent?.remove(this.mesh);
    disposeMeshes(this.mesh);
  }
}

function disposeMeshes(obj: THREE.Object3D) {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.dispose();
    if (obj.material instanceof THREE.Material) {
      obj.material.dispose();
    }
  }

  if (obj.children) {
    for (let child of obj.children) {
      disposeMeshes(child);
    }
  }
}

abstract class MovableObject extends BaseObject {
  gltf: GLTF;

  constructor(type: string, name: string) {
    super(type, name);
  }

  abstract tick(delta: number): void;
}

export { BaseObject, MovableObject };