import * as THREE from 'three';
import { Scene } from './scenes/Scene';
import { PerspectiveCamera } from './scenes/Camera';
import { Renderer } from './scenes/Renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraController } from './utils/CameraController';
import { Loop } from './utils/Loop';
import { loadAssets } from './utils/loadAssets';

import { BaseCharacter } from './objects/characters/BaseCharacter';
import { SpongeBob } from './objects/characters/SpongeBob.ts';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { Ground } from './objects/Ground.ts';

import { ObstacleGenerator } from './utils/ObstacleGenerator';
import { Controller } from './controller.ts';

import { Stage } from './stage/Stage.ts';


class Game {
    status: string;

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;
    cameraController: CameraController;
    loop: Loop;

    controller: Controller

    gltfCharacterDict: { [key: string]: GLTF } = {};
    gltfObstacleDict: { [key: string]: GLTF } = {};
    audioDict: { [key: string]: AudioBuffer } = {};
    textureDict: { [key: string]: { [key: string]: THREE.Texture } } = {};

    Character: BaseCharacter;
    obstacles: BaseObstacle[] = [];
    ground: Ground;
    stages: Stage[] = [];

    obstacleGenerator: ObstacleGenerator;

    constructor() {
        this.init();
    }

    async init() {
        this.status = 'paused';
        await loadAssets(this.gltfCharacterDict, this.gltfObstacleDict);



        this.scene = new Scene();
        this.obstacleGenerator = new ObstacleGenerator(this.gltfObstacleDict);
        this.initCharacter();
        // this.initObstacles();
        this.initGround();
        this.initStage();
        this.controller = new Controller(this.stages[0], this.Character);


        this.camera = this.Character.camera
        this.renderer = new Renderer();
        this.loop = new Loop(this.scene, this.camera, this.renderer);

        document.body.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        this.registerEventHandlers();

        this.reset();
        this.start();
    }

    reset() {
        this.loop.updatableLists = [];
        this.loop.updatableLists.push([this.Character]);
        this.loop.updatableLists.push(this.obstacles);
        this.loop.updatableLists.push([this.controller]);
        this.loop.updatableLists.push(this.stages);

    }

    start() {
        this.status = 'playing';
        this.loop.start();
    }

    pause() {
        this.status = 'paused';
        const Character_index = this.loop.updatableLists.indexOf([this.Character]);
        if (Character_index !== -1) this.loop.updatableLists.splice(Character_index, 1);
    }

    resume() {
        this.status = 'playing';
        const Character_index = this.loop.updatableLists.indexOf([this.Character]);
        if (Character_index === -1) this.loop.updatableLists.push([this.Character]);
    }

    initCharacter() {
        const spongeBob = new SpongeBob('spongeBob', this.gltfCharacterDict);
        spongeBob.rescale(1, 1, 1);
        this.Character=spongeBob;


        
        this.scene.add(this.Character);
        this.Character.addBoundingBoxHelper(this.scene.getScene());
        
        spongeBob.mesh.position.set(0, 0, 3);
    }

    initGround() {
        this.ground = new Ground('firstGround');
        this.scene.add(this.ground);
    }

    initStage() {
        this.stages[0] = new Stage('firstStage', 0, this.obstacleGenerator);
        this.scene.add(this.stages[0]);
    }

    registerEventHandlers() {
        document.addEventListener("gameover", (e) => {
            if (!(e instanceof CustomEvent)) return;
            // this.pause();
            this.status = "gameover";
            console.log("gameover", e.detail.obstacle);
        })
    }

}

export { Game };