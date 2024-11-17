import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Ceiling extends BaseObject {
    constructor(name: string, width: number = 5, height: number = 5) {
        console.log('createCeiling');
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ color: 0x909090 });
        const ceiling = new THREE.Mesh(geometry, material);
        ceiling.rotation.x = Math.PI / 2; // 使平面水平放置
        ceiling.receiveShadow = true; // 接收阴影
        super('ground', name, ceiling);
        this.setCeiling(height);
    }

    setCeiling(height: number) {
        this.mesh.position.y = height / 2;
    }
}

export { Ceiling };