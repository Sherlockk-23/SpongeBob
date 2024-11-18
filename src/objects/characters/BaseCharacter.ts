import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObject, MovableObject } from '../BaseObject';
import { InputHandler } from '../../utils/InputHandler';
import { PerspectiveCamera } from '../../scenes/Camera';
import { Scene } from '../../scenes/Scene';
import { Renderer } from '../../scenes/Renderer';

interface Effect {
    duration: number;
    apply: (character: BaseCharacter) => void;
    remove: (character: BaseCharacter) => void;
}

abstract class BaseCharacter extends MovableObject {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    accel: THREE.Vector3;
    camera: PerspectiveCamera;
    effects: { [key: string]: Effect } = {};

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
    movement: string;
    movementUpdated: boolean = false;
    newMovement: string;

    delta: number = 0.05;
    defaultMaxVel: number = 20;
    defaultMinVel: number = 0.1;
    defaultMaxJumpVel: number = 2;
    defaultDeaccel: number = 5;
    defaultAccel: number = 1.5;
    defaultGravity: number = 2;

    inputHandler: InputHandler;

    constructor(name: string, characterGLTF: GLTF) {
        super('character', name, characterGLTF);
        this.rescale(1, 1, 1);
        this.camera = new PerspectiveCamera(this);
        // this.init();  handled by child class
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
        return Math.abs(this.movableBoundary['down'] - bbox.min.y) < this.delta;
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
            this.vel.y = this.defaultMaxJumpVel;
        }
        if (this.inputHandler.isKeyPressed('c') && !this.onGround()) {
            this.vel.y = -2 * this.defaultMaxJumpVel;
        }
        this.accel.y = -this.defaultGravity;
    }

    updateVelocity(delta: number): void {
        this.vel.add(this.accel.clone().multiplyScalar(delta));
        // this.vel.clampLength(0, this.defaultMaxVel);
        this.vel.x = Math.min(Math.max(this.vel.x, -this.defaultMaxVel), this.defaultMaxVel);
        this.vel.y = Math.min(Math.max(this.vel.y, -this.defaultMaxJumpVel), this.defaultMaxJumpVel);
        this.vel.z = Math.min(Math.max(this.vel.z, -this.defaultMaxVel), this.defaultMaxVel);
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
        if (!this.onGround()) {
            this.updateMovementTmp('jumping');
        }
    }

    updateCondition(condition: string): void {
        if (this.condition == condition) return;
        this.condition = condition;
        const newgltf = this.updateConditionMesh(condition);
        console.log('newgltf:', newgltf);
        this.changeGLTF(newgltf);
        this.initAnimation();
        if (this.condition == 'dead') {
            this.rescale(0.5, 0.5, 0.5);
        } else if (this.condition == 'robotic') {
            this.rescale(1, 1.5, 1);
        }
        this.cameraShake(1, 200);
    }

    updateMovement(): void {
        if (this.movement == this.newMovement) return;
        this.movement = this.newMovement;
        let { animationId } = this.updateMovementAnimation(this.movement);
        this.initAnimation(animationId);
    }

    applyEffect(effectName: string, effect: Effect) {
        if (this.effects[effectName]) {
            this.effects[effectName].remove(this);
        }
        this.effects[effectName] = effect;
        effect.apply(this);
    }

    updateEffects(delta: number) {
        for (const effectName in this.effects) {
            const effect = this.effects[effectName];
            effect.duration -= delta;
            if (effect.duration <= 0) {
                effect.remove(this);
                delete this.effects[effectName];
            }
        }
    }

    tick(delta: number): void {
        this.updateAcceleration(delta);
        this.updateVelocity(delta);
        this.updatePosition(delta);
        this.updateBoundingBox();
        this.updateEffects(delta);
        this.camera.update();
        console.log(this.name, 'position:', this.mesh.position);
        // console.log(this.name, 'velocity:', this.vel);
        this.updateMovement();
        // console.log(this.name, 'is', this.movement);
        this.animate(delta);
        // this.mesh.updateMatrix();
        // this.mesh.updateMatrix();
        // this.mesh.updateMatrixWorld();
        // this.mesh.parent?.updateMatrixWorld(true);
        // this.mesh.parent?.updateWorldMatrix(true, true);
    }

    cameraShake(intensity: number, duration: number) {
        this.camera.shake(intensity, duration);
    }

    reset() {
        this.updateCondition('normal');
        this.newMovement = 'idle';
        this.updateMovement();
        this.mesh.position.set(0, 0, 0);   
        this.vel.set(0, 0, 0);
        this.accel.set(0, 0, 0); 
        // this.mesh.updateMatrix();
        // this.mesh.updateMatrixWorld();
        // this.mesh.parent?.updateMatrixWorld(true);
        // this.mesh.parent?.updateWorldMatrix(true, true);
    }

    abstract updateMovementAnimation(movement: string): { animationId: number };

    abstract updateConditionMesh(condition: string): { newgltf: GLTF };
}

export { BaseCharacter };