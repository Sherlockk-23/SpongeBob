import * as THREE from 'three';
import { UIController } from './ui';
import { AudioManager } from './AudioManager.ts';
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
import { Patrick } from './objects/characters/Patrick.ts';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { Ground } from './objects/Ground.ts';

import { ObstacleGenerator } from './utils/ObstacleGenerator';
import { ItemGenerator } from './utils/ItemGenerator';
import { Controller } from './controller.ts';

import { Stage } from './stage/Stage.ts';


class Game {
    status: string;
    uiController: UIController;
    audioManager: AudioManager;
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;
    cameraController: CameraController;
    loop: Loop;

    controller: Controller
    controllerListForLoop: Controller[] = [];

    gltfCharacterDict: { [key: string]: GLTF } = {};
    gltfObstacleDict: { [key: string]: GLTF } = {};
    gltfItemDict: { [key: string]: GLTF } = {};
    audioDict: { [key: string]: AudioBuffer } = {};
    // textureDict: { [key: string]: { [key: string]: THREE.Texture } } = {};
    textureDict: { [key: string]: THREE.Texture } = {};

    Character: BaseCharacter;
    CharacterListForLoop: BaseCharacter[] = [];
    ground: Ground;
    // stages: Stage[] = [];

    obstacleGenerator: ObstacleGenerator;
    itemGenerator: ItemGenerator;

    constructor() {
        this.init();
    }

    async init() {
        this.status = 'paused';
        this.uiController = new UIController();
        this.uiController.loadingScreen();

        await loadAssets(this.gltfCharacterDict, this.gltfObstacleDict, this.gltfItemDict, this.textureDict);

        this.audioManager = AudioManager.getInstance();

        this.scene = new Scene();
        this.obstacleGenerator = new ObstacleGenerator(this.gltfObstacleDict);
        this.itemGenerator = new ItemGenerator(this.gltfItemDict);

        this.initCharacter();

        this.controller = new Controller(this.scene, this.Character,
            this.obstacleGenerator, this.itemGenerator, this.textureDict);


        this.camera = this.Character.camera
        this.renderer = new Renderer();
        this.loop = new Loop(this.scene, this.camera, this.renderer);

        const container = document.getElementById('scene-container') as HTMLElement;

        container.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        this.uiController.removeLoadingScreen();

        await this.audioManager.loadAndPlayBGM();

        this.reset();
        this.start();
        this.pause();
        await this.uiController.countdown(5);
        this.status = "playing";
        this.resume();

        this.registerEventHandlers();
    }

    reset() {
        this.Character.reset();

        this.controller.init();

        this.loop.updatableLists = [];
        this.CharacterListForLoop = [this.Character];
        this.controllerListForLoop = [this.controller];
        console.log("length of list for loop", this.controllerListForLoop.length);
        this.loop.updatableLists.push(this.CharacterListForLoop);
        this.loop.updatableLists.push(this.controllerListForLoop);
        // this.loop.updatableLists.push(this.stages);

    }

    start() {
        this.loop.start();
    }

    pause() {
        const Character_index = this.loop.updatableLists.indexOf(this.CharacterListForLoop);
        if (Character_index !== -1) this.loop.updatableLists.splice(Character_index, 1);
        const controller_index = this.loop.updatableLists.indexOf(this.controllerListForLoop);
        if (controller_index !== -1) this.loop.updatableLists.splice(controller_index, 1);
        // const stage_index = this.loop.updatableLists.indexOf(this.stages);
        // if (stage_index !== -1) this.loop.updatableLists.splice(stage_index, 1);
        console.log("pausing ", this.loop.updatableLists);

        // if(showPause)this.uiController.pause();
    }

    resume() {
        const Character_index = this.loop.updatableLists.indexOf(this.CharacterListForLoop);
        if (Character_index === -1) this.loop.updatableLists.push(this.CharacterListForLoop);
        const controller_index = this.loop.updatableLists.indexOf(this.controllerListForLoop);
        if (controller_index === -1) this.loop.updatableLists.push(this.controllerListForLoop);
        // const stage_index = this.loop.updatableLists.indexOf(this.stages);
        // if (stage_index === -1) this.loop.updatableLists.push(this.stages);
        console.log("resuming ", this.loop.updatableLists);
    }

    initCharacter() {
        const selectedCharacter = localStorage.getItem('selectedCharacter'); // Retrieve choice

        if (selectedCharacter === 'spongebob') {
            const spongeBob = new SpongeBob('spongeBob', this.gltfCharacterDict);
            spongeBob.rescale(1, 1, 1);
            this.Character = spongeBob;

            this.scene.getScene().add(this.Character.mesh);
            this.Character.addBoundingBoxHelper(this.scene.getScene());

            spongeBob.mesh.position.set(0, 0, 3);
        } else {
            const patrick = new Patrick('patrick', this.gltfCharacterDict);
            patrick.rescale(1, 1, 1);
            this.Character = patrick;

            this.scene.getScene().add(this.Character.mesh);
            this.Character.addBoundingBoxHelper(this.scene.getScene());

            patrick.mesh.position.set(0, 0, 3);
        }
    }


    // initStage() {
    //     this.stages[0] = new Stage(this.scene, 'firstStage', 0, this.obstacleGenerator, this.itemGenerator);
    //     this.scene.add(this.stages[0]);
    // }

    registerEventHandlers() {
        window.addEventListener("click", () => {
            if (this.status === "paused") {
                this.status = "playing";
                this.resume();
                this.uiController.resume();
            }
            else if (this.status === "playing") {
                this.status = "paused";
                this.pause();
                this.uiController.pause();
            }
            // else if (this.status === "gameover") {
            //     // maybe jump to front page
            //     window.location.reload();
            //     this.reset();
            //     this.resume();
            //     this.status = "playing";
            //     this.uiController.restart();
            // }
        });
        document.addEventListener("gameover", (e) => {
            if (!(e instanceof CustomEvent)) return;
            this.pause();
            this.status = "gameover";
            this.uiController.lose();
            console.log("gameover", e.detail.obstacle);
        })
    }

}

export { Game };