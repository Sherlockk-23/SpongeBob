import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export function cloneGLTF(gltf: GLTF): GLTF {
    const clonedScene = gltf.scene.clone(true);
    const clonedAnimations = gltf.animations.map(animation => animation.clone());
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
    return clonedMesh;
}