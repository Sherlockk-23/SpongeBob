import * as THREE from 'three';
import { Scene } from './scenes/Scene';
import { PerspectiveCamera } from './scenes/Camera';
import { Renderer } from './scenes/Renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraController } from './utils/CameraController';

class Game {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;
    cameraController: CameraController;

    constructor() {
        this.init();
    }

    async init() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(window.innerWidth / window.innerHeight);
        this.renderer = new Renderer();

        document.body.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        await this.loadAssets();
        this.animate();
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    async loadAssets() {
        let promises: Promise<any>[] = [];
        const gltfLoader = new GLTFLoader();

        function gltfPromise(path: string) {
            return new Promise<THREE.Group>((resolve, reject) => {
                gltfLoader.load(
                    path,
                    (gltf) => {
                        resolve(gltf.scene);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        promises.push(gltfPromise('assets/glfs/spongeBob1/scene.gltf').then((mesh) => {
            // 遍历子对象，找到并移除背景板
            mesh.traverse((child) => {
                console.log(child, child.name);
                if (child.isMesh && child.name === 'Object_101') {
                    mesh.remove(child);
                }
                if (child.isMesh && child.name === 'Cube024_0') {
                    mesh.remove(child);
                }
            });
    
            this.scene.add(mesh);
            console.log('Loaded GLTF model:', mesh);
        }).catch((error) => {
            console.error('Error loading GLTF model:', error);
        }));

        await Promise.all(promises);
    }
}

export { Game };