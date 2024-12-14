import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import { cloneGLTF } from '../../utils/mesh';
import { AudioManager } from '../../AudioManager';

class BaseObstacle extends MovableObject {

    collidedCnt: number = 0;
    colliding: boolean = false;
    collidedThreshold: number = 100;
    audioManager: AudioManager;
    punchedTime: number = 0;

    vel: THREE.Vector3;

    counter: number = 0;

    constructor(name: string, obstacle_gltf: GLTF) {
        const clonedGLTF = cloneGLTF(obstacle_gltf);
        super('obstacle', name, clonedGLTF);
        this.audioManager = AudioManager.getInstance();
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
        if (this.name.includes('rock') || this.name.includes('shiba') || this.name.includes('dog') || this.name.includes('cat')) {
            if (this.getBottomCenter().y <= 0) {
                this.vel.y = 0;
                if (this.counter == 0) {
                    this.audioManager.playFallSound();
                    this.counter += 1;
                }
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

    oscillate() {
        if (this.name.includes('boatTSCP')) {
            if (this.getBottomCenter().x <= -3) {
                this.vel.x = 1;
            }
            if (this.getBottomCenter().x >= 3) {
                this.vel.x = -1;
            }
        }
    }

    jellyfish_and_phantomMotion() {
        if (this.name.includes('jelly_fish') || this.name.includes('phantom')) {
            //move in a circle
            if (this.getBottomCenter().y <= 0 && this.getBottomCenter().x <= -3 && this.vel.y < 0) {
                this.vel.y = 0;
                this.vel.x = 1;
            }
            else if (this.getBottomCenter().y <= 0 && this.getBottomCenter().x >= 3 && this.vel.x > 0) {
                if (Math.random() < 0.5) {
                    this.vel.y = 2;
                    this.vel.x = 0;
                }
                else {
                    this.vel.y = 0;
                    this.vel.x = -1;
                }
            }
            else if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x >= 3 && this.vel.y > 0) {
                this.vel.y = 0;
                this.vel.x = -1.5;
            }
            else if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x <= -3 && this.vel.x < 0) {
                this.vel.y = -2;
                this.vel.x = 0;
            }
            else if (this.getBottomCenter().y <= 0 && this.getBottomCenter().x <= -3 && this.vel.x < 0) {
                if (Math.random() < 0.5) {
                    this.vel.y = 0;
                    this.vel.x = 1;
                }
                else {
                    this.vel.y = 2;
                    this.vel.x = 0;
                }

            }
            else if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x >= 3 && this.vel.x > 0) {
                this.vel.y = -2;
                this.vel.x = 0;
            }
            else if (this.getBottomCenter().y >= 3 && this.getBottomCenter().x <= -3 && this.vel.y > 0) {
                this.vel.y = 0;
                this.vel.x = 1.5;
            }
            else if (this.getBottomCenter().y <= 0 && this.getBottomCenter().x >= 3 && this.vel.y < 0) {
                this.vel.y = 0;
                this.vel.x = -1;
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
        this.jellyfish_and_phantomMotion();
        this.oscillate();
    }
}

export { BaseObstacle };