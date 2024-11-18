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

class ParticleSystem {
    particles: THREE.Points;
    velocities: THREE.Vector3[];
    duration: number;
    elapsedTime: number;

    constructor(position: THREE.Vector3, particleCount: number = 100, duration: number = 1) {
        this.duration = duration;
        this.elapsedTime = 0;

        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        this.velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(position.x, position.y, position.z);
            this.velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
        this.particles = new THREE.Points(geometry, material);
    }

    update(delta: number): boolean {
        this.elapsedTime += delta;
        if (this.elapsedTime >= this.duration) {
            return false;
        }

        const positions = this.particles.geometry.attributes.position.array as number[];
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.velocities[i / 3].x * delta;
            positions[i + 1] += this.velocities[i / 3].y * delta;
            positions[i + 2] += this.velocities[i / 3].z * delta;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        return true;
    }
}

export { ParticleSystem };