import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObject, MovableObject } from '../BaseObject';
import { InputHandler } from '../../utils/InputHandler';
import { cloneGLTF } from '../../utils/mesh';

class BaseCharacter extends MovableObject {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    accel: THREE.Vector3;
    // used to tell the 6 boundary of the character for position update
    movableBoundary: { [key: string]: number } = {
        'forward': 1000,
        'backward': -1000,
        'left': -1000,
        'right': 1000,
        'up': 1000,
        'down': 0
    };

    //condition can be normal, robotic, highjump, scary
    condition : string = 'normal'; 


    defaultMaxVel: number = 1;
    defaultMinVel: number = 0.05;
    defaultDeaccel: number = 0.3;
    defaultAccel: number = 1;

    mixer: THREE.AnimationMixer | null = null;
    animations: THREE.AnimationClip[] = [];

    inputHandler: InputHandler;

    constructor(name: string, character_gltf: GLTF) {
        // const clonedGLTF = cloneGLTF(character_gltf);
        // dunno why, but this dont work
        super('character', name, character_gltf.scene);
        this.gltf = character_gltf;
        this.init();
    }

    init() {
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.accel = new THREE.Vector3(0, 0, 0);
        this.inputHandler = new InputHandler();
        //console.log(this.name, 'bboxParameter:', this.bboxParameter);

        if (this.gltf.animations && this.gltf.animations.length > 0) {
            console.log(this.name, 'has animations');
            this.mixer = new THREE.AnimationMixer(this.mesh);
            this.animations = this.gltf.animations;
            this.mixer.clipAction(this.animations[0]).play();
        } else {
            console.log(this.name, 'has no animations');
        }

        // 更新克隆对象的世界矩阵
        this.mesh.updateMatrixWorld(true);
    }

    onGround(): boolean{
        const bbox = new THREE.Box3().setFromObject(this.mesh);
        return this.movableBoundary['down'] == bbox.min.y;
    }

    updateAcceleration(delta: number, acceleration: number = this.defaultAccel, deceleration: number = this.defaultDeaccel) {
        if (this.inputHandler.isKeyPressed('w')) {
            this.accel.z = acceleration;
        } else if (this.inputHandler.isKeyPressed('s')) {
            this.accel.z = -acceleration;
        } else {
            if (Math.abs(this.vel.z) < this.defaultMinVel) {
                this.accel.z = 0;
                this.vel.z = 0;
            } else if (this.vel.z > 0) {
                this.accel.z = -deceleration;
            } else {
                this.accel.z = deceleration;
            }
        }

        if (this.inputHandler.isKeyPressed('a')) {
            this.accel.x = acceleration;
        } else if (this.inputHandler.isKeyPressed('d')) {
            this.accel.x = -acceleration;
        } else {
            if (Math.abs(this.vel.x) < this.defaultMinVel) {
                this.accel.x = 0;
                this.vel.x = 0;
            } else if (this.vel.x > 0) {
                this.accel.x = -deceleration;
            } else {
                this.accel.x = deceleration;
            }
        }
        this.accel.y = -acceleration;
    }

    updateVelocity(delta: number): void {
        this.vel.add(this.accel.clone().multiplyScalar(delta));
        this.vel.clampLength(0, this.defaultMaxVel);
        if(this.inputHandler.isKeyPressed(' ') && this.onGround()){
            this.vel.y = 30;
        }
    }

    updatePosition(delta: number): void {
        this.mesh.position.add(this.vel.clone().multiplyScalar(delta));
        // to check if the character touching any boundary
        // if so, set the velocity to 0 and set the most position to the boundary
        const bbox = new THREE.Box3().setFromObject(this.mesh);
        for (const direction in this.movableBoundary) {
            const boundary = this.movableBoundary[direction];
            if (direction == 'forward' && bbox.max.z > boundary) {
                if(this.vel.z>0)this.vel.z = 0;
                this.mesh.position.z -= bbox.max.z - boundary;
            } else if (direction == 'backward' && bbox.min.z < boundary) {
                if(this.vel.z<0)this.vel.z = 0;
                this.mesh.position.z += boundary - bbox.min.z;
            } else if (direction == 'left' && bbox.min.x < boundary) {
                if(this.vel.x<0)this.vel.x = 0;
                this.mesh.position.x += boundary - bbox.min.x;
            } else if (direction == 'right' && bbox.max.x > boundary) {
                if(this.vel.x>0)this.vel.x = 0;
                this.mesh.position.x -= bbox.max.x - boundary;
            } else if (direction == 'up' && bbox.max.y > boundary) {
                if(this.vel.y>0)this.vel.y = 0;
                this.mesh.position.y -= bbox.max.y - boundary;
            } else if (direction == 'down' && bbox.min.y < boundary) {
                if(this.vel.y<0)this.vel.y = 0;
                this.mesh.position.y += boundary - bbox.min.y;
            }
        }
    }

    animate(delta: number): void {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.updateAcceleration(delta);
        this.updateVelocity(delta);
        this.updatePosition(delta);

        this.animate(delta);

        this.updateBoundingBox();
        // console.log(this.name, 'position:', this.mesh.position);
        // console.log(this.name, 'velocity:', this.vel);
        // console.log(this.name, 'acceleration:', this.accel);
    }
}

export { BaseCharacter };