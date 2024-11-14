import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObject, MovableObject } from '../BaseObject';
import { InputHandler } from '../../utils/InputHandler';
import { cloneGLTF } from '../../utils/mesh';

abstract class BaseCharacter extends MovableObject {
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

    //condition can be normal, robotic, highjump, scary, dead
    condition: string = 'normal';
    //movement can be walking, running, jumping, idle
    movement: string ;
    movementUpdated: boolean = false;
    newMovement: string ;    

    delta: number = 0.05;
    defaultMaxVel: number = 2;
    defaultMinVel: number = 0.1;
    defaultDeaccel: number = 0.8;
    defaultAccel: number = 1.5;
    defaultGravity: number = 2;

    inputHandler: InputHandler;

    // gltfDict: {[key:string]: GLTF};

    constructor(name: string, characterGLTF: GLTF) {
        // const clonedGLTF = cloneGLTF(character_gltf);
        // dunno why, but this dont work
        super('character', name, characterGLTF);
        this.rescale(1,1,1);
        // this.init();  hanled by child class
    }

    init() {
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.accel = new THREE.Vector3(0, 0, 0);
        this.inputHandler = new InputHandler();

        this.condition = 'normal';
        this.newMovement = 'idle';
        this.updateCondition(this.condition);
        this.updateMovement();
    }

    onGround(): boolean {
        const bbox = new THREE.Box3().setFromObject(this.mesh);
        return Math.abs(this.movableBoundary['down']-bbox.min.y)<this.delta;
    }

    updateMovementTmp(movement: string): void {
        this.newMovement = movement;
    }

    updateAcceleration(delta: number, acceleration: number = this.defaultAccel, deceleration: number = this.defaultDeaccel) {
        if (this.inputHandler.isKeyPressed('w')) {
            this.accel.z = acceleration;
            this.updateMovementTmp('running');
        } else if (this.inputHandler.isKeyPressed('s')) {
            this.accel.z = -acceleration;
            this.updateMovementTmp('running');
        } else {
            if (Math.abs(this.vel.z) < this.defaultMinVel) {
                this.accel.z = 0;
                this.vel.z = 0;
            } else if (this.vel.z > 0) {
                this.accel.z = -deceleration;
            } else {
                this.accel.z = deceleration;
            }
            this.updateMovementTmp('walking');
        }

        if (this.inputHandler.isKeyPressed('a')) {
            this.accel.x = acceleration;
            this.updateMovementTmp('running');
        } else if (this.inputHandler.isKeyPressed('d')) {
            this.accel.x = -acceleration;
            this.updateMovementTmp('running');
        } else {
            if (Math.abs(this.vel.x) < this.defaultMinVel) {
                this.accel.x = 0;
                this.vel.x = 0;
            } else if (this.vel.x > 0) {
                this.accel.x = -deceleration;
            } else {
                this.accel.x = deceleration;
            }
            this.updateMovementTmp('walking');
        }
        if (this.inputHandler.isKeyPressed(' ') && this.onGround()) {
            this.vel.y = this.defaultMaxVel;
        }
        this.accel.y = -this.defaultGravity;

    }

    updateVelocity(delta: number): void {
        this.vel.add(this.accel.clone().multiplyScalar(delta));
        this.vel.clampLength(0, this.defaultMaxVel);
    }

    updatePosition(delta: number): void {
        this.mesh.position.add(this.vel.clone().multiplyScalar(delta));
        // to check if the character touching any boundary
        // if so, set the velocity to 0 and set the most position to the boundary
        const bbox = new THREE.Box3().setFromObject(this.mesh);
        for (const direction in this.movableBoundary) {
            const boundary = this.movableBoundary[direction];
            if (direction == 'forward' && bbox.max.z > boundary) {
                if (this.vel.z > 0) this.vel.z = 0;
                this.mesh.position.z -= bbox.max.z - boundary;
            } else if (direction == 'backward' && bbox.min.z < boundary) {
                if (this.vel.z < 0) this.vel.z = 0;
                this.mesh.position.z += boundary - bbox.min.z;
            } else if (direction == 'left' && bbox.min.x < boundary) {
                if (this.vel.x < 0) this.vel.x = 0;
                this.mesh.position.x += boundary - bbox.min.x;
            } else if (direction == 'right' && bbox.max.x > boundary) {
                if (this.vel.x > 0) this.vel.x = 0;
                this.mesh.position.x -= bbox.max.x - boundary;
            } else if (direction == 'up' && bbox.max.y > boundary) {
                if (this.vel.y > 0) this.vel.y = 0;
                this.mesh.position.y -= bbox.max.y - boundary;
            } else if (direction == 'down' && bbox.min.y < boundary) {
                if (this.vel.y < 0) this.vel.y = 0;
                this.mesh.position.y += boundary - bbox.min.y;
            }
        }
        if(!this.onGround()){
            this.updateMovementTmp('jumping');
        }
    }

    updateCondition(condition: string): void {
        if(this.condition==condition) return;
        this.condition = condition;
        const newgltf = this.updateConditionMesh(condition);
        console.log('newgltf:', newgltf);
        this.changeGLTF(newgltf);
        this.initAnimation();
        if(this.condition == 'dead'){
            this.rescale(0.5,0.5,0.5);
        }else if(this.condition == 'robotic'){
            this.rescale(1,1.5,1);
        }
    }

    updateMovement(): void {
        if(this.movement==this.newMovement) return;
        this.movement = this.newMovement;
        let {animationId} = this.updateMovementAnimation(this.movement);
        this.initAnimation(animationId);
    }

    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.updateAcceleration(delta);
        this.updateVelocity(delta);
        this.updatePosition(delta);
        this.updateBoundingBox();
        console.log(this.name, 'position:', this.mesh.position);
        console.log(this.name, 'velocity:', this.vel);
        // console.log(this.name, 'acceleration:', this.accel);
        this.updateMovement();
        console.log(this.name, 'is', this.movement);
        this.animate(delta);
        
    }

    abstract updateMovementAnimation(movement: string): {animationId: number};

    abstract updateConditionMesh(condition: string): {newgltf: GLTF};
}

export { BaseCharacter };