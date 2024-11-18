import * as THREE from "three";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { PerspectiveCamera } from "../scenes/Camera";
import { cloneGLTF } from '../utils/mesh';

import { ParticleSystem } from "../utils/mesh";

abstract class BaseObject {
  type: string;
  name: string;
  mesh: THREE.Object3D;
  boundingBoxHelper: THREE.BoxHelper | null = null;

  constructor(type: string, name: string, mesh?: THREE.Object3D) {
    this.type = type;
    this.name = name;
    this.mesh = new THREE.Object3D();
    this.mesh.add(mesh);
    this.mesh.castShadow = true;
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = bbox.getSize(new THREE.Vector3());
    this.boundingBoxHelper = new THREE.BoxHelper(this.mesh, 0xff0000);
    // this.mesh.add(this.boundingBoxHelper);
  }

  destruct(scene: THREE.Scene = NaN) {
    if (scene && (this.type === 'item' || this.type === 'obstacle')) {
      console.log(this.name, 'is destructing');
      // 创建粒子系统
      const particleSystem = new ParticleSystem(this.mesh.position.clone());
      scene.add(particleSystem.particles);

      // 移除对象并释放资源
      this.mesh.parent?.remove(this.mesh);
      disposeMeshes(this.mesh);

      // 更新粒子系统
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (!particleSystem.update(delta)) {
          scene.remove(particleSystem.particles);
        }
      };
      animate();
    } else {
      // 如果类型不是 'item' 或 'obstacle'，直接移除并释放资源
      this.mesh.parent?.remove(this.mesh);
      disposeMeshes(this.mesh);
    }
  }

  rescale(targetWidth: number, targetHeight: number, targetDepth: number) {
    // if(this.type === 'character'){
    //   this.characterRescale(targetWidth, targetHeight, targetDepth);
    //   return;
    // }
    this.mesh.scale.set(1, 1, 1);
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const bottomCenter = new THREE.Vector3(center.x, bbox.min.y, center.z);

    // 计算缩放比例
    const scaleX = targetWidth / size.x;
    const scaleY = targetHeight / size.y;
    const scaleZ = targetDepth / size.z;

    // 应用缩放
    this.mesh.scale.set(scaleX, scaleY, scaleZ);
    // this.setPosition(bottomCenter.x, bottomCenter.y, bottomCenter.z);

    // 重新计算包围盒
    this.updateBoundingBox();

    // // 更新位置以确保包围盒正确包围角色
    // const newBbox = new THREE.Box3().setFromObject(this.mesh);
    // const newCenter = newBbox.getCenter(new THREE.Vector3());
    // const newBottomCenter = new THREE.Vector3(newCenter.x, newBbox.min.y, newCenter.z);
    // const offset = new THREE.Vector3().subVectors(newBottomCenter, this.mesh.position);
    // this.mesh.position.sub(offset);

    // // 更新包围盒
    // this.updateBoundingBox();

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

  rotate(axis: 'x' | 'y' | 'z', angle: number) {
    this.mesh.rotation[axis] += angle;
    this.updateBoundingBox();
  }

  // Set absolute rotation in radians
  setRotation(x: number, y: number, z: number) {
    this.mesh.rotation.set(x, y, z);
    this.updateBoundingBox();
  }

  // Rotate to face a specific point
  lookAt(x: number, y: number, z: number) {
    this.mesh.lookAt(new THREE.Vector3(x, y, z));
    this.updateBoundingBox();
  }

  // Set rotation using Euler angles (in radians)
  setEulerRotation(x: number, y: number, z: number, order: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY' = 'XYZ') {
    this.mesh.rotation.set(x, y, z, order);
    this.updateBoundingBox();
  }

  // Rotate around a specific axis by a quaternion
  rotateOnAxis(axis: THREE.Vector3, angle: number) {
    this.mesh.rotateOnAxis(axis.normalize(), angle);
    this.updateBoundingBox();
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

  initAnimation(animationId: number = 0) {
    console.log(this.name, 'is initializing animation', animationId);
    if (this.gltf.animations && this.gltf.animations.length > animationId) {
      console.log(this.name, 'has animations');
      this.mixer = new THREE.AnimationMixer(this.mesh);
      this.animations = this.gltf.animations;
      this.mixer.clipAction(this.animations[animationId]).play();
      console.log(this.name, this.animations, this.mixer);
    }
    else
      console.log(this.name, 'has no animations');
  }
  changeGLTF(gltf: GLTF, animationId: number = 0) {
    // 获取当前mesh的包围盒信息
    // const clonedGLTF = cloneGLTF(gltf);
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const bottomCenter = new THREE.Vector3(center.x, bbox.min.y, center.z);

    // 保存当前mesh的相机子对象
    // console.log("Ochildren:",this.mesh.children);
    // const cameras : THREE.PerspectiveCamera[] = this.mesh.children.filter(child => child.constructor.name === 'PerspectiveCamera');
    // console.log(this.name, 'is changing to', gltf, cameras);

    // // 清空当前mesh的所有子对象，保留相机
    // while (this.mesh.children.length > 0) {
    //     const child = this.mesh.children[0];
    //     this.mesh.remove(child);
    // }

    const children = this.mesh.children;
    children.forEach(child => {
      if (child instanceof THREE.Camera) {

      } else {
        this.mesh.remove(child);
      }
    });

    // 释放当前mesh的几何体和材质
    disposeMeshes(this.mesh);

    this.mesh.add(gltf.scene);
    this.rescale(1, 1, 1);

    // 更新动画混合器和动画剪辑
    this.mixer = null;
    this.animations = [];
    this.gltf = gltf;
    this.setPosition(bottomCenter.x, bottomCenter.y, bottomCenter.z);
    this.initAnimation(animationId);

    console.log(this.name, 'is changed to', gltf);
  }



  animate(delta: number): void {
    if (this.mixer) {
      // console.log(this.name, 'is animating');
      this.mixer.update(delta);
    }
  }


  abstract tick(delta: number): void;
}
function disposeMeshes(obj: THREE.Object3D) {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.dispose();
    if (Array.isArray(obj.material)) {
      obj.material.forEach(material => material.dispose());
    } else if (obj.material) {
      obj.material.dispose();
    }
  }

  if (obj.children) {
    for (let child of obj.children) {
      disposeMeshes(child);
    }
  }
}
export { BaseObject, MovableObject };