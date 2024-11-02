import * as THREE from 'three';
import { Scene } from './scenes/Scene';
import { PerspectiveCamera } from './scenes/Camera';
import { Renderer } from './scenes/Renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraController } from './utils/CameraController';
import { Loop } from './utils/Loop';

import { BaseCharactor } from './objects/charactors/BaseCharactor';
import { SpongeBob } from './objects/charactors/SpongeBob.ts';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { Ground } from './objects/Ground.ts';

class Game {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;
    cameraController: CameraController;
    loop: Loop;

    gltfDict: { [key: string]: THREE.Group | THREE.Object3D } = {};
    audioDict: { [key: string]: AudioBuffer } = {};
    textureDict: { [key: string]: { [key: string]: THREE.Texture } } = {};

    charactors: BaseCharactor[] = [];
    obstacles: BaseObstacle[] = [];
    ground: Ground | null = null;

    constructor() {
        this.init();
    }

    async init() {
        await this.loadAssets();

        this.scene = new Scene();
        this.initCharactor();
        this.initObstacles();
        this.initGround();
        this.camera = new PerspectiveCamera(this.charactors[0], window.innerWidth / window.innerHeight);
        this.renderer = new Renderer();
        this.loop = new Loop(this.scene, this.camera, this.renderer);

        document.body.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        

        this.reset();
        this.start();
    }

    reset() {
        

        this.loop.updatableLists = [];
        this.loop.updatableLists.push(this.charactors);
        this.loop.updatableLists.push(this.obstacles);

        
    }

    start() {
        this.loop.start();
    }

    pause() {
        const charactor_index = this.loop.updatableLists.indexOf(this.charactors);
        if (charactor_index !== -1) this.loop.updatableLists.splice(charactor_index, 1);
    }

    resume() {
        const charactor_index = this.loop.updatableLists.indexOf(this.charactors);
        if (charactor_index === -1) this.loop.updatableLists.push(this.charactors);
    }

    initCharactor() {
        const spongeBob = new SpongeBob('spongeBob', this.gltfDict['spongeBobWalk']);
        this.charactors.push(spongeBob);

        this.charactors.forEach(charactor => {
            this.scene.add(charactor);
        });
    }

    initObstacles() {
        const parickHorse = new BaseObstacle('parickHorse', this.gltfDict['parickHorse']);
        this.obstacles.push(parickHorse);

        this.obstacles.forEach(obstacle => {
            this.scene.add(obstacle);
        });
    }

    initGround() {
        this.ground = new Ground('firstGround');
        this.scene.add(this.ground);
    }

    async loadAssets() {
        let promises: Promise<any>[] = [];
        const gltfLoader = new GLTFLoader();

        function gltfPromise(path: string) {
            return new Promise<THREE.Group>((resolve, reject) => {
                gltfLoader.load(
                    path,
                    (gltf) => {
                        resolve(gltf);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        promises.push(gltfPromise('assets/models/spongeBobWalk/scene.gltf').then((gltf) => {
            this.gltfDict['spongeBobWalk'] = gltf;
            console.log('Loaded GLTF model:', gltf);
        }));
        promises.push(gltfPromise('assets/models/parickHorse/scene.gltf').then((gltf) => {
            this.gltfDict['parickHorse'] = gltf;
            console.log('Loaded GLTF model:', gltf);
        }));

        await Promise.all(promises);
    }
}

export { Game };