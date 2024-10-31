import * as THREE from 'three';

class Scene {
    scene: THREE.Scene;

    constructor(){
        this.scene = new THREE.Scene();
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
