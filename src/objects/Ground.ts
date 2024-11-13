import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Ground extends BaseObject {
    constructor(name: string, width: number = 10, height: number = 1000) {
        console.log('createGround');
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2; // 使平面水平放置
        ground.receiveShadow = true; // 接收阴影
        super('ground', name, ground);
        this.createGround(width, height);
    }

    createGround(width: number = 10, height: number = 1000) {

    }
}

export { Ground };