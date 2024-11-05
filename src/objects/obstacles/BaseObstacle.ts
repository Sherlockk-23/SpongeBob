import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';

class BaseObstacle extends MovableObject {

    bboxParameter: { width: number; height: number; depth: number; };

    mixer: THREE.AnimationMixer | null = null;
    animations: THREE.AnimationClip[] = [];

    constructor(name: string, character_gltf: GLTF) {
        super('obstacle', name);
        this.gltf = character_gltf;
        this.init();
    }

    init() {
        this.mesh = this.gltf.scene;

        const bbox = new THREE.Box3().setFromObject(this.mesh);
        const size = bbox.getSize(new THREE.Vector3());
        this.bboxParameter = { width: size.x, height: size.y, depth: size.z };

        if (this.gltf.animations && this.gltf.animations.length > 0) {
            console.log(this.name, 'has animations');
            this.mixer = new THREE.AnimationMixer(this.mesh);
            this.animations = this.gltf.animations;
            this.mixer.clipAction(this.animations[0]).play();
        }
        else
            console.log(this.name, 'has no animations');
    }

    animate(delta: number): void {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    tick(delta: number): void {

        console.log(this.name, 'is ticking');

        this.animate(delta);
    }
}

export { BaseObstacle };