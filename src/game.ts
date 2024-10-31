import * as THREE from 'three';

import {Scene} from './scenes/Scene';
import {PerspectiveCamera} from './scenes/Camera';
import {Renderer} from './scenes/Renderer';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


class Game{
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;

    constructor(){
        this.init();
    }

    async init(){
        this.start();
    }

    public start(){
        this.animate();
    }

    private animate(){
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    async loadAssets(){
        let promises: Promise<any>[] = [];
        // load 3d models
        const gltfLoader = new GLTFLoader();
        function gltfPromise(path: string) {
            return new Promise<THREE.Group>(
                (resolve, reject) => {
                    gltfLoader.load(path, (gltf) => {
                        resolve(gltf.scene);
                    });
                }
            );
        }

        promises.push(gltfPromise('assets/glfs/spongeBob1/scene.gltf').then((mesh) => {
            this.scene.add(mesh);
        }));
    }
}
