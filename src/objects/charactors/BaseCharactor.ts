import * as THREE from "three";
import { BaseObject, MovableObject } from "../BaseObject";

class BaseCharactor extends MovableObject {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    accel: THREE.Vector3;

    mixer: THREE.AnimationMixer | null = null;
    animations: THREE.AnimationClip[] = [];

    constructor(name: string, charactor_mesh: THREE.Object3D | null ) {
        super('charactor', name);
        this.mesh = charactor_mesh;
        if (this.mesh.animations && this.mesh.animations.length > 0) {
            console.log('has animations');
            this.mixer = new THREE.AnimationMixer(this.mesh);
            this.animations = this.mesh.animations;
            this.mixer.clipAction(this.animations[0]).play(); // 播放第一个动画
        }
        else
            console.log('no animations');
        this.init();
    }

    init() {
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.accel = new THREE.Vector3(0, 0, 0);
    }

    animate(delta: number): void {
        console.log('animating');
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    tick(delta: number): void {
        //throw new Error("Method not implemented.");
        console.log('ticking');
        this.mesh.position.add(this.vel.clone().multiplyScalar(delta));
        this.vel.add(this.accel.clone().multiplyScalar(delta));
        this.animate(delta);
    }
}

export { BaseCharactor };