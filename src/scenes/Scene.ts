import * as THREE from 'three';
import { BaseObject } from '../objects/BaseObject';

class Scene {
    scene: THREE.Scene;

    constructor(){
        this.scene = new THREE.Scene();
        this.addLights();
    }

    private addLights() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
    }

    add(object: BaseObject) {
        if (object.mesh) {
          this.scene.add(object.mesh);
        }
    }

    remove(object: BaseObject) {
        if (object.mesh) {
          this.scene.remove(object.mesh);
        }
    }

    public getScene(){
        return this.scene;
    }
}

export { Scene };