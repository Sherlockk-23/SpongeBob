import * as THREE from 'three';

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

    public add(object: THREE.Object3D){
        this.scene.add(object);
    }

    public remove(object: THREE.Object3D){
        this.scene.remove(object);
    }

    public getScene(){
        return this.scene;
    }
}

export { Scene };