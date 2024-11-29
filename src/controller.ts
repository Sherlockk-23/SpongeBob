import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loop } from './utils/Loop';
import { AudioManager } from './AudioManager';
import { BaseCharacter } from './objects/characters/BaseCharacter';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { BaseObject } from './objects/BaseObject.ts';

import { Stage } from './stage/Stage.ts';

import { Ground } from './objects/Ground.ts';

import { Scene } from './scenes/Scene.ts';

import { updateMovableBoundary, checkCollision } from './utils/Collision.ts';

import { ObstacleGenerator } from './utils/ObstacleGenerator';
import { ItemGenerator } from './utils/ItemGenerator';
import { BaseEnemy } from './objects/enemies/BaseEnemy.ts';

import { UIController } from './ui.ts';


class Controller {

    stages: Stage[] = [];
    character: BaseCharacter;
    scene: Scene;
    obstacleGenerator: ObstacleGenerator;
    itemGenerator: ItemGenerator;
    textureDict: { [key: string]: THREE.Texture } = {};

    stageidx: number = 0;

    totalTime: number = 0;
    enemyMinVel: number = 0.4;
    enemyMaxVel: number = 3;
    enemyDist: number = 15;
    enemyPos: number = -20;

    enemy: BaseEnemy;

    uicontroller: UIController;
    private audioManager: AudioManager;

    constructor(scene: Scene, character: BaseCharacter, obstacleGenerator: ObstacleGenerator,
        itemGenerator: ItemGenerator, textureDict: { [key: string]: THREE.Texture } = {},
        uiController: UIController) {
        this.scene = scene;
        this.character = character;
        this.obstacleGenerator = obstacleGenerator;
        this.itemGenerator = itemGenerator
        this.textureDict = textureDict;
        this.uicontroller = uiController;
        this.audioManager = AudioManager.getInstance();
        // this.init();
    }


    init() {
        for (let stage of this.stages) {
            stage.destruct();
        }
        this.stages = [];
        this.stages.push(new Stage(this.scene, 'stage1', 0, this.obstacleGenerator, this.itemGenerator, this.textureDict));
        this.stageidx = 0;

        this.enemy = new BaseEnemy('jellyKing', this.obstacleGenerator.gltfDict['fish']);
        this.enemy.rescale(5, 4, 4);
        this.scene.getScene().add(this.enemy.mesh);
        this.enemy.setPosition(0, 0, -20);
        // this.character.mesh.add(this.enemy.mesh);

        this.scene.getScene().fog = new THREE.Fog(0x87CEFA, 0.5, 50);
    }

    changeStage() {
        console.log('change stage');
        this.stageidx += 1;
        this.stages.push(new Stage(this.scene, 'stage' + (this.stageidx + 1), this.stageidx,
            this.obstacleGenerator, this.itemGenerator, this.textureDict));
        this.stages[this.stageidx].mesh.position.z =
            this.stages[this.stageidx - 1].mesh.position.z + this.stages[this.stageidx - 1].length;
        if (this.stageidx > 1) {
            this.stages[this.stageidx - 2].destruct();
        }
    }

    getCharactorMovableBoundary() {
        let movableBoundary: { [key: string]: number } = {
            'forward': 1000,
            'backward': -1000,
            'left': -1000,
            'right': 1000,
            'up': 1000,
            'down': 0
        };
        let stage = this.stages[this.stageidx];
        for (let obstacle of stage.nearestObstacles) {
            updateMovableBoundary(this.character, obstacle, movableBoundary);
        }
        movableBoundary['up'] = Math.min(movableBoundary['up'], stage.ceiling.mesh.position.y);
        movableBoundary['down'] = Math.max(movableBoundary['down'], stage.ground.mesh.position.y);
        movableBoundary['left'] = Math.max(movableBoundary['left'], stage.leftWall.mesh.position.x);
        movableBoundary['right'] = Math.min(movableBoundary['right'], stage.rightWall.mesh.position.x);
        if (this.stageidx > 0)
            stage = this.stages[this.stageidx - 1];
        for (let obstacle of stage.nearestObstacles) {
            updateMovableBoundary(this.character, obstacle, movableBoundary);
        }
        movableBoundary['up'] = Math.min(movableBoundary['up'], stage.ceiling.mesh.position.y);
        movableBoundary['down'] = Math.max(movableBoundary['down'], stage.ground.mesh.position.y);
        movableBoundary['left'] = Math.max(movableBoundary['left'], stage.leftWall.mesh.position.x);
        movableBoundary['right'] = Math.min(movableBoundary['right'], stage.rightWall.mesh.position.x);

        this.character.movableBoundary = movableBoundary;
        // console.log(this.character.movableBoundary);
    }
    checkCollisionItems(stage: Stage) {
        for (let item of stage.nearestItems) {
            if (checkCollision(this.character, item)) {
                this.audioManager.playPickItemSound();
                console.log('collide with item ', item.name);
                item.applyEffect(this.character);
                if (item.name.includes('xbox')) {
                    this.uicontroller.swapItem('metal');
                } else if (item.name.includes('soda')) {
                    this.uicontroller.swapItem('green');
                } else if (item.name.includes('sauce')) {
                    this.uicontroller.swapItem('pink');
                }
                // item.applyEffect(this.character);
                stage.removeItem(item);
            }
        }
        if (this.character.waiting_effect[0] == '') {
            this.uicontroller.swapItem('none');
        }
    }

    checkCollisionObstacles(stage: Stage, delta: number) {
        for (let obstacle of stage.nearestObstacles) {
            if (checkCollision(this.character, obstacle)) {
                // document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by '+ obstacle.name } }));
                console.log('collide with obstacle ' + obstacle.name);

                if (this.character.condition == 'robotic') {
                    this.audioManager.playBreakSound();
                    stage.removeObstacle(obstacle);
                } else if (obstacle.name.includes('bottom')) {
                    this.audioManager.playBoundingSound();
                    this.character.vel.y = this.character.defaultMaxJumpVel;
                } else {
                    if (!obstacle.colliding) {
                        obstacle.colliding = true;
                        obstacle.collidedCnt++;
                    }
                    if (obstacle.collidedCnt >= 3) {
                        this.audioManager.playBreakSound();
                        stage.removeObstacle(obstacle);
                    }
                    if (this.character.movement == 'punching') {
                        obstacle.punchedTime += delta;
                    }
                    if (obstacle.punchedTime > 1.5) {
                        this.audioManager.playBreakSound();
                        stage.removeObstacle(obstacle);
                    }
                }
            } else {
                obstacle.colliding = false;
            }
        }
    }
    checkToChangeStage() {
        // console.log(this.character.getBottomCenter().z, this.stages[this.stageidx].length);
        if (this.character.getBottomCenter().z + 70 > this.stages[this.stageidx].length + this.stages[this.stageidx].mesh.position.z) {
            this.changeStage();
        }
    }

    updateFog() {
        const fogStart = 0.5 + this.character.mesh.position.z * 0.1;
        const fogEnd = 50 + this.character.mesh.position.z * 0.1;
        this.scene.getScene().fog.near = fogStart;
        this.scene.getScene().fog.far = fogEnd;
    }


    tick(delta: number) {
        // 1. check if the character is colliding with any of the items, this may cause logic to change
        // 2. check if the character is colliding with any of the obstacles, this may cause logic to change
        // 3. check if the character is to be colliding with ground, and use this to update the character's movable direction



        this.stages[this.stageidx].updateNearestList(this.character.mesh.position.clone(), 20);
        this.stages[this.stageidx].tick(delta);
        this.checkCollisionObstacles(this.stages[this.stageidx], delta);
        this.checkCollisionItems(this.stages[this.stageidx]);
        console.log(this.stageidx);
        if (this.stageidx > 0) {
            this.stages[this.stageidx - 1].tick(delta);
            this.stages[this.stageidx - 1].updateNearestList(this.character.mesh.position.clone(), 20);
            this.checkCollisionObstacles(this.stages[this.stageidx - 1], delta);
            this.checkCollisionItems(this.stages[this.stageidx - 1]);
        }
        this.getCharactorMovableBoundary();
        this.checkToChangeStage();
        this.updateFog();

        this.totalTime += delta;
        const distanceValueElement = document.getElementById('distance-value');
        if (distanceValueElement) {
            distanceValueElement.textContent = this.character.mesh.position.z.toFixed(0); // Display z position rounded to 2 decimals
        }

        

        this.enemy.tick(delta);
        const enemyVel = this.enemyMinVel + (this.enemyMaxVel - this.enemyMinVel) *
            ((this.character.mesh.position.z - this.enemyPos) / this.enemyDist);
        console.log("enemy vel: ", enemyVel, "char pos: ", this.character.mesh.position.z, "enemy pos: ", this.enemyPos);
        this.enemyPos += enemyVel * delta;
        this.enemyPos = Math.max(this.enemyPos, this.character.mesh.position.z - this.enemyDist);
        this.enemy.setPosition(0, 0, this.enemyPos);

        const enemyBox = new THREE.Box3().setFromObject(this.enemy.mesh);
        const distance = Math.abs(this.character.mesh.position.z - enemyBox.max.z);
        if(distance < 2 && distance > 1.95) {
            this.audioManager.playWarningSound();
        }

        const distanceBarFill = document.getElementById('distance-bar-fill');
        const movingIcon = document.getElementById('s-icon');
        if (distanceBarFill && movingIcon) {
            
            const maxDistance = this.enemyDist; // Use maxDistance as a scaling factor
            const normalizedDistance = Math.min(distance / maxDistance, 1);
            distanceBarFill.style.height = `${normalizedDistance * 100}%`;
            movingIcon.style.bottom = `${normalizedDistance * 100}%`;
            const red = Math.round(255 * (1 - normalizedDistance));
            const green = Math.round(255 * normalizedDistance);
            const color = `rgb(${red}, ${green}, 0)`;


            distanceBarFill.style.backgroundColor = color;

        }
       
        
        if (checkCollision(this.character, this.enemy)) {
            document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by enemy' } }));
        }


    }

}
export { Controller };