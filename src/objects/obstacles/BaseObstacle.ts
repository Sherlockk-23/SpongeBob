import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import { cloneGLTF } from '../../utils/mesh';

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
        this.collidedCnt = 0;
        this.colliding = false;
        this.punchedTime = 0;
        this.vel = new THREE.Vector3(0, 0, 0);
    }

    updatePosition(delta: number) {
        this.mesh.position.add(this.vel.clone().multiplyScalar(delta));
    }

    ensureOnGround() {
        if (this.name.includes('rock')) {
            if (this.getBottomCenter().y <= 0) {
                this.vel.y = 0;
            }
        }

    }

    rebound() {
        if (this.name.includes('tiki')) {
            if (this.getTopCenter().y <= 0.15) {
                this.vel.y = -this.vel.y;
            }
            if (this.getBottomCenter().y >= 0.1) {
                this.vel.y = -this.vel.y;
            }
        }
    }

    jellyfishMotion() {
        if (this.name.includes('jelly_fish')) {
            //move in a circle
            if (this.getBottomCenter().y <= 1.5 && this.getBottomCenter().x <= -3) {
                this.vel.y = 0;
                this.vel.x = 1;
            }
            if (this.getBottomCenter().y <= 1.5 && this.getBottomCenter().x >= 3) {
                this.vel.y = 1;
                this.vel.x = 0;
            }
            if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x >= 3) {
                this.vel.y = 0;
                this.vel.x = -1;
            }
            if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x <= -3) {
                this.vel.y = -1;
                this.vel.x = 0;
            }
        }
    }

    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.animate(delta);
        this.updatePosition(delta);
        this.updateBoundingBox();
        this.ensureOnGround();
        this.rebound();
        this.jellyfishMotion();
    }
}

export { BaseObstacle };