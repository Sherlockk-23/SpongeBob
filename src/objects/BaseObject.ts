import * as THREE from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

abstract class BaseObject {
  type: string;
  name: string;
  mesh: THREE.Object3D;
  boundingBoxHelper: THREE.BoxHelper | null = null;

  constructor(type: string, name: string, mesh?: THREE.Object3D) {
    this.type = type;
    this.name = name;
    this.mesh = mesh || new THREE.Object3D();
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = bbox.getSize(new THREE.Vector3());
    this.boundingBoxHelper = new THREE.BoxHelper(this.mesh, 0xff0000);
    // this.mesh.add(this.boundingBoxHelper);
  }

  destruct() {
    this.mesh.parent?.remove(this.mesh);
    disposeMeshes(this.mesh);
  }

  rescale(targetWidth: number, targetHeight: number, targetDepth: number) {
    // 计算当前包围盒
    this.mesh.scale.set(1, 1, 1);
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // 计算缩放比例
    const scaleX = targetWidth / size.x;
    const scaleY = targetHeight / size.y;
    const scaleZ = targetDepth / size.z;
    // console.log(this.name, size.x, size.y, size.z, scaleX, scaleY, scaleZ);

    // 应用缩放
    this.mesh.scale.set(scaleX, scaleY, scaleZ);
    this.updateBoundingBox();

  }

  updateBoundingBox() {
    if (this.boundingBoxHelper) {
      this.boundingBoxHelper.update();
    }
    // update bboxparemeter according to boundingBoxHelper
  }

  addBoundingBoxHelper(scene: THREE.Scene) {
    scene.add(this.boundingBoxHelper);
  }

  setPosition(x: number, y: number, z: number) {
    // 计算当前包围盒
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    // 计算底面中心点
    const bottomCenter = new THREE.Vector3(center.x, bbox.min.y, center.z);

    // 计算偏移量
    const offset = new THREE.Vector3(x, y, z).sub(bottomCenter);

    // 应用偏移量
    this.mesh.position.add(offset);

    // 更新包围盒
    this.updateBoundingBox();
    console.log(this.name, center, bottomCenter, offset);
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
  mixer: THREE.AnimationMixer | null = null;
  animations: THREE.AnimationClip[] = [];

  constructor(type: string, name: string, gltf: GLTF) {
    super(type, name, gltf.scene);
    this.gltf = gltf;
    this.initAnimation();
  }

  initAnimation() {
    if (this.gltf.animations && this.gltf.animations.length > 0) {
      console.log(this.name, 'has animations');
      this.mixer = new THREE.AnimationMixer(this.mesh);
      this.animations = this.gltf.animations;
      this.mixer.clipAction(this.animations[0]).play();
      console.log(this.name, this.animations, this.mixer);
    }
    else
      console.log(this.name, 'has no animations');
  }

  changeGLFT(gltf: GLTF) {}

  animate(delta: number): void {
    if (this.mixer) {
        console.log(this.name, 'is animating');
        this.mixer.update(delta);
    }
  }


  abstract tick(delta: number): void;
}

export { BaseObject, MovableObject };