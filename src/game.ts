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

    Characters: BaseCharacter[] = [];
    obstacles: BaseObstacle[] = [];
    ground: Ground;
    stages: Stage[] = [];

    obstacleGenerator: ObstacleGenerator;

    constructor() {
        this.init();
    }

    async init() {
        await loadAssets(this.gltfCharacterDict, this.gltfObstacleDict);



        this.scene = new Scene();
        this.obstacleGenerator = new ObstacleGenerator(this.gltfObstacleDict);
        this.initCharacter();
        // this.initObstacles();
        this.initGround();
        this.initStage();
        this.controller = new Controller(this.obstacles, this.ground, this.Characters[0]);


        this.camera = new PerspectiveCamera(this.Characters[0], window.innerWidth / window.innerHeight);
        this.renderer = new Renderer();
        this.loop = new Loop(this.scene, this.camera, this.renderer);

        document.body.appendChild(this.renderer.domElement);

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);



        this.reset();
        this.start();
    }

    reset() {
        this.loop.updatableLists = [];
        this.loop.updatableLists.push(this.Characters);
        this.loop.updatableLists.push(this.obstacles);
        this.loop.updatableLists.push([this.controller]);
        this.loop.updatableLists.push(this.stages);

    }

    start() {
        this.loop.start();
    }

    pause() {
        const Character_index = this.loop.updatableLists.indexOf(this.Characters);
        if (Character_index !== -1) this.loop.updatableLists.splice(Character_index, 1);
    }

    resume() {
        const Character_index = this.loop.updatableLists.indexOf(this.Characters);
        if (Character_index === -1) this.loop.updatableLists.push(this.Characters);
    }

    initCharacter() {
        const spongeBob = new SpongeBob('spongeBob', this.gltfCharacterDict['spongeBobWalk']);
        spongeBob.rescale(1, 1, 1);
        this.Characters.push(spongeBob);


        this.Characters.forEach(Character => {
            this.scene.add(Character);
            Character.addBoundingBoxHelper(this.scene.getScene());
        });
        spongeBob.mesh.position.set(0, 0, 3);
    }

    // initObstacles() {
    //     for (let i = 0; i < 20; i++) {
    //         const obstacle = this.obstacleGenerator.randomObstacle(i);
    //         this.obstacles.push(obstacle);
    //         this.scene.add(obstacle);
    //         obstacle.setPosition(i, 0, 2 * i + 1);
    //         obstacle.addBoundingBoxHelper(this.scene.getScene());
    //         // well this works
    //     }

    // }

    initGround() {
        this.ground = new Ground('firstGround');
        this.scene.add(this.ground);
    }

    initStage() {
        this.stages[0] = new Stage('firstStage', 0, this.obstacleGenerator);
        this.scene.add(this.stages[0]);
    }

}

export { Game };