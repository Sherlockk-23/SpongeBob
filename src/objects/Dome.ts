import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Dome extends BaseObject {
    constructor(name: string, width: number = 10, length: number = 10,  texture: THREE.Texture = null, 
        textureWidth: number = 1, textureHeight: number = 1)
    {
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

        let material;
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(width / textureWidth, length / textureHeight); // 根据宽度和长度设置重复次数
            material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
        } else {
            material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        }

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