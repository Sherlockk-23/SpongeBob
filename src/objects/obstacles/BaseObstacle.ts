import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import {cloneGLTF} from '../../utils/mesh';

class BaseObstacle extends MovableObject {

    collidedCnt: number = 0;
    colliding: boolean = false;
    collidedThreshold: number = 100;

    punchedTime: number = 0;

    vel: THREE.Vector3;

    constructor(name: string, obstacle_gltf: GLTF) {
        const clonedGLTF = cloneGLTF(obstacle_gltf);
        super('obstacle', name, clonedGLTF);
        this.init();
    }

    init() {
        this.collidedCnt=0;
        this.colliding=false;
        this.punchedTime=0;
        this.vel = new THREE.Vector3(0, 0, 0);
    }

    updatePosition(delta: number) {
        this.mesh.position.add(this.vel.clone().multiplyScalar(delta));
    }



    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.animate(delta);
        this.updatePosition(delta);
        this.updateBoundingBox();
    }
}

export { BaseObstacle };