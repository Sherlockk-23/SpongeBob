import * as THREE from 'three';
import { BaseObject } from '../objects/BaseObject';

class Scene {
    scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEFA); // 设置背景颜色为白色
        this.addLights();
        // this.addFloor();
    }

    private addLights() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true; // 使光源投射阴影
        directionalLight.shadow.mapSize.width = 2048; // 阴影映射的宽度
        directionalLight.shadow.mapSize.height = 2048; // 阴影映射的高度
        directionalLight.shadow.camera.near = 0.5; // 阴影摄像机的近剪切面
        directionalLight.shadow.camera.far = 500; // 阴影摄像机的远剪切面
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // 添加点光源
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        pointLight.castShadow = true; // 使点光源投射阴影
        this.scene.add(pointLight);

        // 添加更多光源以确保地板被照亮
        const additionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        additionalLight.position.set(-10, 10, -10);
        additionalLight.castShadow = true; // 使额外光源投射阴影
        this.scene.add(additionalLight);

    }


    add(object: BaseObject) {
        if (object.mesh) {
            object.mesh.castShadow = true;
            object.mesh.receiveShadow = true;
            this.scene.add(object.mesh);
        }
    }

    remove(object: BaseObject) {
        if (object.mesh) {
            this.scene.remove(object.mesh);
        }
    }

    getScene() {
        return this.scene;
    }
}

export { Scene };