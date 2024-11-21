import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import {cloneGLTF} from '../../utils/mesh';

class BaseEnemy extends MovableObject {

    pos: THREE.Vector3;
    vel: THREE.Vector3;

    constructor(name: string, obstacle_gltf: GLTF) {
        const clonedGLTF = cloneGLTF(obstacle_gltf);
        super('enemy', name, clonedGLTF);
        this.init();
    }

    init() {
    }


    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.animate(delta);
        this.updateBoundingBox();
    }
}

export { BaseEnemy };