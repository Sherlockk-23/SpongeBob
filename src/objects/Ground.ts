import * as THREE from 'three';
import { BaseObject } from './BaseObject';

class Ground extends BaseObject {
    constructor(name: string, width: number = 10, height: number = 1000, texture: THREE.Texture = null, 
        textureWidth: number = 1, textureHeight: number = 1)
    {
        console.log('createGround');
        const geometry = new THREE.PlaneGeometry(width, height);

        let material;
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(width / textureWidth, height / textureHeight); // 根据宽度和高度设置重复次数
            material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
        } else {
            material = new THREE.MeshStandardMaterial({ color: 0x808080 });
        }

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2; // 使平面水平放置
        ground.receiveShadow = true; // 接收阴影
        super('ground', name, ground);
        this.createGround(width, height);
    }

    createGround(width: number = 5, height: number = 1000) {
        // 这里可以添加其他创建地面的逻辑
    }
}

export { Ground };