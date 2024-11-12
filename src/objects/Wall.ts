import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Wall extends BaseObject {
    constructor(name: string, width: number = 1000, height: number = 10) {
        console.log('createWall');
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, side: THREE.DoubleSide });
        const wall = new THREE.Mesh(geometry, material);
        wall.receiveShadow = true; // 接收阴影
        super('wall', name, wall);
    }

    setAsLeftWall() {
        this.mesh.position.x = -5;
        this.mesh.rotation.y = Math.PI / 2;
    }

    setAsRightWall() {
        this.mesh.position.x = 5;
        this.mesh.rotation.y = -Math.PI / 2;
    }
}

export { Wall };