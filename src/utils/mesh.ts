import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export function cloneGLTF(gltf: GLTF): GLTF {
    const clonedScene = gltf.scene.clone(true);
    const clonedAnimations = gltf.animations.map(animation => animation.clone());

    // 更新克隆对象的世界矩阵
    clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.geometry = child.geometry.clone();
            if (Array.isArray(child.material)) {
                child.material = child.material.map(material => material.clone());
            } else {
                child.material = child.material.clone();
            }
        }
    });

    clonedScene.updateMatrixWorld(true);

    return {
        ...gltf,
        scene: clonedScene,
        animations: clonedAnimations
    };
}

export function cloneMesh(mesh: THREE.Mesh): THREE.Mesh {
    const clonedGeometry = mesh.geometry.clone();
    const clonedMaterial = Array.isArray(mesh.material)
        ? mesh.material.map(material => material.clone())
        : mesh.material.clone();
    const clonedMesh = new THREE.Mesh(clonedGeometry, clonedMaterial);
    clonedMesh.copy(mesh);

    // 更新克隆对象的世界矩阵
    clonedMesh.updateMatrixWorld(true);

    return clonedMesh;
}