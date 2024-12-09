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
    force: THREE.Vector3;
    camera: PerspectiveCamera;

    waiting_effect: [string, Effect] = ['', { duration: 0, apply: (char: BaseCharacter) => { }, remove: (char: BaseCharacter) => { } }];
    effects: { [key: string]: Effect } = {};
    // effect: Effect;

    fog: THREE.Fog;

    // used to tell the 6 boundary of the character for position update
    movableBoundary: { [key: string]: number } = {
        'forward': 1000,
        'backward': -1000,
        'left': -1000,
        'right': 1000,
        'up': 1000,
        'down': 0
    };

    //condition can be normal, robotic, highjump, scary, dead, dance
    condition: string = 'normal';
    //movement can be walking, running, jumping, idle, punching, dance
    movement: string;
    movementUpdated: boolean = false;
    newMovement: string;
    punchingTime: number = 0;

    delta: number = 0.05;
    defaultMaxVel: number = 3.5;
    defaultMinVel: number = 0.1;
    defaultMaxJumpVel: number = 4.2;
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
        this.force = new THREE.Vector3(0, 0, 0);
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
        if (this.inputHandler.isKeyPressed('w') || true) {
            this.accel.z = acceleration;
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
        if (this.inputHandler.isKeyPressed('w') && this.onGround()) {
            this.vel.y = this.defaultMaxJumpVel / 2;
        }
        if (this.inputHandler.isKeyPressed('s') && !this.onGround()) {
            this.vel.y = -this.defaultMaxJumpVel;
        }
        this.accel.y = -this.defaultGravity;
        this.accel.add(this.force);
    }

    updateVelocity(delta: number): void {
        this.vel.add(this.accel.clone().multiplyScalar(delta));
        // this.vel.clampLength(0, this.defaultMaxVel);
        this.vel.x = Math.min(Math.max(this.vel.x, -this.defaultMaxVel), this.defaultMaxVel);
        this.vel.y = Math.min(Math.max(this.vel.y, -this.defaultMaxJumpVel), this.defaultMaxJumpVel);
        this.vel.z = Math.min(Math.max(this.vel.z, -this.defaultMaxVel), this.defaultMaxVel);
    }

    updatePosition(delta: number): void {
        if (this.condition == 'dance') {
            this.vel.set(0, 0, 0);
            this.accel.set(0, 0, 0);
            return;
        }
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

    }

    getMovement() {

        this.updateMovementTmp('walking');
        if (this.vel.z == this.defaultMaxVel)
            this.updateMovementTmp('running');
        if (this.inputHandler.isKeyPressed('j')) {
            this.updateMovementTmp('punching');
        }
        if (!this.onGround())
            this.updateMovementTmp('jumping');

        if (this.condition == 'dance') {
            this.updateMovementTmp('dance');
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
            if (this.name == 'spongeBob') {
                this.rescale(2, 2, 1.5);
            } else {
                this.rescale(1.3, 2.5, 1.3);
            }
        } else if (this.condition == 'dance') {
            this.camera.closeUp();
        }
        this.cameraShake(1, 200);
    }

    updateMovement(delta: number = 0): void {
        this.punchingTime = Math.max(0, this.punchingTime - delta);
        if (this.movement == this.newMovement) return;
        if (this.punchingTime > 0) return;
        this.movement = this.newMovement;
        let { animationId } = this.updateMovementAnimation(this.movement);
        this.initAnimation(animationId);
        if (this.movement == 'punching') {
            this.punchingTime = 0.4;
        }
    }

    applyEffect(effectName: string, effect: Effect) {
        // allow a lot of effects
        if (this.effects[effectName]) {
            this.effects[effectName].remove(this);
        }
        this.effects[effectName] = effect;
        effect.apply(this);

        //only allow one effect at a time
        // for (const effectName in this.effects) {
        //     const effect = this.effects[effectName];
        //     effect.remove(this);
        //     delete this.effects[effectName];
        // }
        // this.effects[effectName] = effect;
        // effect.apply(this);
    }

    pickEffect(effectName: string, effect: Effect) {
        // remove that in ui
        this.waiting_effect = [effectName, effect];
        // add that in ui
    }


    updateEffects(delta: number) {
        // check apply
        if (this.inputHandler.isKeyPressed('k')) {
            if (this.waiting_effect[0] != '') {
                this.applyEffect(this.waiting_effect[0], this.waiting_effect[1]);
                this.waiting_effect = ['', { duration: 0, apply: (char: BaseCharacter) => { }, remove: (char: BaseCharacter) => { } }];
            }
        }
        // update the effect

        for (const effectName in this.effects) {
            const effect = this.effects[effectName];
            effect.duration -= delta;
            if (effect.duration <= 0) {
                effect.remove(this);
                delete this.effects[effectName];
            }
        }
    }

    debugLogging() {
        if (this.condition != 'robotic') return;
        console.log("debug robot", 'position:', this.mesh.position);
        console.log("debug robot", 'box:', this.getBottomCenter());
    }

    updateCamera(delta: number) {
        if (this.inputHandler.isKeyPressed('q')) {
            this.camera.perspective = 'thirdPerson';
        }
        if (this.inputHandler.isKeyPressed('e')) {
            this.camera.perspective = 'secondPerson';
        }
        this.camera.update();
    }

    tick(delta: number): void {
        this.updateAcceleration(delta);
        this.updateVelocity(delta);
        this.updatePosition(delta);
        this.updateBoundingBox();
        this.updateEffects(delta);
        this.updateCamera(delta);
        // console.log(this.name, 'position:', this.mesh.position);
        // console.log(this.name, 'velocity:', this.vel);
        this.updateMovement(delta);
        // console.log(this.name, 'is', this.movement);
        this.animate(delta);
        this.getMovement();

        // console.log('debuging effects', this.waiting_effect, this.effects);
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