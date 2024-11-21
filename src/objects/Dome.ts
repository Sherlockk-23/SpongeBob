import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Dome extends BaseObject {
    constructor(name: string, width: number = 10, length: number = 10, textureUrl: string) {
        console.log('createDome');
        
        // 创建半圆柱体几何体
        const radius = width / 2;
        const height = length;
        const radialSegments = 32;
        const heightSegments = 1;
        const openEnded = true;
        const thetaStart = 0;
        const thetaLength = Math.PI;

        const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

        // 加载纹理
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(textureUrl);
        const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });

        const dome = new THREE.Mesh(geometry, material);
        dome.rotation.z = Math.PI / 2; // 使其成为拱形
        dome.rotation.y = Math.PI / 2; // 使其朝向z轴
        dome.receiveShadow = true; // 接收阴影
        super('dome', name, dome);
    }

    setDome(height: number) {
        this.mesh.position.y = height;
    }
}

export { Dome };