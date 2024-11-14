import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from './BaseObject';

class Item extends MovableObject {


    mixer: THREE.AnimationMixer | null = null;
    animations: THREE.AnimationClip[] = [];

    constructor(name: string, item_gltf: GLTF) {
        super('item', name, item_gltf.scene);
        this.gltf = item_gltf;
        this.init();
    }

    init() {
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

        //console.log(this.name, 'is ticking');

        this.animate(delta);
    }
}

export { Item };