import * as THREE from 'three';
import { UIController } from './ui';

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
import { ItemGenerator } from './utils/ItemGenerator';
import { Controller } from './controller.ts';

import { Stage } from './stage/Stage.ts';


class Game {
    status: string;
    uiController: UIController;

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
    textureDict: { [key: string]: { [key: string]: THREE.Texture } } = {};

    Character: BaseCharacter;
    CharacterListForLoop: BaseCharacter[] = [];
    ground: Ground;
    stages: Stage[] = [];

    obstacleGenerator: ObstacleGenerator;
    itemGenerator: ItemGenerator;

    constructor() {
        this.init();
    }

    async init() {
        this.status = 'paused';
        this.uiController = new UIController();
        
        await loadAssets(this.gltfCharacterDict, this.gltfObstacleDict,this.gltfItemDict);
        this.uiController.shallowMenu();


        this.scene = new Scene();
        this.obstacleGenerator = new ObstacleGenerator(this.gltfObstacleDict);
        this.itemGenerator = new ItemGenerator(this.gltfItemDict);
        
        this.initCharacter();
        this.initStage();
        this.controller = new Controller(this.stages[0], this.Character);


        this.camera = this.Character.camera
        this.renderer = new Renderer();
        this.loop = new Loop(this.scene, this.camera, this.renderer);

        const container = document.getElementById('scene-container') as HTMLElement;

        container.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        this.reset();
        this.start();
        this.pause();

        this.registerEventHandlers();

    }

    reset() {
        this.Character.reset();

        this.stages[0].reset();
        this.controller.changeStage(this.stages[0]);
        // this.scene.scene.updateMatrixWorld();

        // console.log("positions of chara and stage",this.Character.mesh.position,this.stages[0].mesh.position);
        //         // 打印 Character 的位置
        // console.log("Character position:", this.Character.mesh.position);

        // // 打印 Character 的位置的具体值
        // console.log("Character position (x, y, z):", this.Character.mesh.position.x, this.Character.mesh.position.y, this.Character.mesh.position.z);

        // // 打印第一个 stage 的位置
        // console.log("Stage position:", this.stages[0].mesh.position);

        // // 打印第一个 stage 的位置的具体值
        // console.log("Stage position (x, y, z):", this.stages[0].mesh.position.x, this.stages[0].mesh.position.y, this.stages[0].mesh.position.z);

        this.loop.updatableLists = [];
        this.CharacterListForLoop=[this.Character];
        this.controllerListForLoop=[this.controller];
        console.log("length of list for loop",this.controllerListForLoop.length);
        this.loop.updatableLists.push(this.CharacterListForLoop);
        this.loop.updatableLists.push(this.controllerListForLoop);
        this.loop.updatableLists.push(this.stages);

    }

    start() {
        this.loop.start();
    }

    pause() {
        const Character_index = this.loop.updatableLists.indexOf(this.CharacterListForLoop);
        if (Character_index !== -1) this.loop.updatableLists.splice(Character_index, 1);
        const controller_index = this.loop.updatableLists.indexOf(this.controllerListForLoop);
        if (controller_index !== -1) this.loop.updatableLists.splice(controller_index, 1);
        const stage_index = this.loop.updatableLists.indexOf(this.stages);
        if (stage_index !== -1) this.loop.updatableLists.splice(stage_index, 1);
        console.log("pausing ",this.loop.updatableLists);
    }

    resume() {
        const Character_index = this.loop.updatableLists.indexOf(this.CharacterListForLoop);
        if (Character_index === -1) this.loop.updatableLists.push(this.CharacterListForLoop);
        const controller_index = this.loop.updatableLists.indexOf(this.controllerListForLoop);
        if (controller_index === -1) this.loop.updatableLists.push(this.controllerListForLoop);
        const stage_index = this.loop.updatableLists.indexOf(this.stages);
        if (stage_index === -1) this.loop.updatableLists.push(this.stages);
        console.log("resuming ",this.loop.updatableLists);
    }

    initCharacter() {
        const spongeBob = new SpongeBob('spongeBob', this.gltfCharacterDict);
        spongeBob.rescale(1, 1, 1);
        this.Character=spongeBob;
        
        this.scene.add(this.Character);
        this.Character.addBoundingBoxHelper(this.scene.getScene());
        
        spongeBob.mesh.position.set(0, 0, 3);
    }


    initStage() {
        this.stages[0] = new Stage(this.scene,'firstStage', 0, this.obstacleGenerator, this.itemGenerator);
        this.scene.add(this.stages[0]);
    }

    registerEventHandlers() {
        window.addEventListener("click", ()=> {
            if (this.status === "paused") {
                this.status = "playing";
                this.resume();
                this.uiController.resume();
            }
            else if(this.status === "playing") {
                this.status = "paused";
                this.pause();
                this.uiController.pause();
            }
            else if (this.status === "gameover") {
                this.reset();
                this.resume();
                this.status = "playing";
                this.uiController.restart();
            }
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