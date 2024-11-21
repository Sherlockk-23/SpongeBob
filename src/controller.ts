import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loop } from './utils/Loop';

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

class Controller {

    stages: Stage[] = [];
    character: BaseCharacter;
    scene: Scene;
    obstacleGenerator: ObstacleGenerator;
    itemGenerator: ItemGenerator;

    stageidx: number = 0;

    totalTime: number = 0;
    enemyVel: number = 2.3;
    enemyPos: number = -20;

    enemy: BaseEnemy;

    constructor(scene: Scene, character: BaseCharacter, obstacleGenerator: ObstacleGenerator, itemGenerator: ItemGenerator) {
        this.scene = scene;
        this.character = character;
        this.obstacleGenerator = obstacleGenerator;
        this.itemGenerator = itemGenerator
        // this.init();
    }


    init() {
        for (let stage of this.stages) {
            stage.destruct();
        }
        this.stages = [];
        this.stages.push(new Stage(this.scene, 'stage1', 0, this.obstacleGenerator, this.itemGenerator));
        this.stageidx = 0;

        this.enemy = new BaseEnemy('jellyKing', this.obstacleGenerator.gltfDict['bus']);
        this.enemy.rescale(5, 5, 5);
        this.scene.getScene().add(this.enemy.mesh);
        this.enemy.setPosition(0, 0, -20);
        // this.character.mesh.add(this.enemy.mesh);
    }

    changeStage() {
        console.log('change stage');
        this.stageidx += 1;
        this.stages.push(new Stage(this.scene, 'stage' + (this.stageidx + 1), this.stageidx, this.obstacleGenerator, this.itemGenerator));
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
                console.log('collide with item ', item.name);
                item.applyEffect(this.character);
                stage.removeItem(item);
            }
        }

    }

    checkCollisionObstacles(stage: Stage) {
        for (let obstacle of stage.nearestObstacles) {
            if (checkCollision(this.character, obstacle)) {
                // document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by '+ obstacle.name } }));
                console.log('collide with obstacle ' + obstacle.name);
                if (obstacle.name == 'bottom') {
                    this.character.vel.y = this.character.defaultMaxJumpVel;
                }
                if (this.character.condition == 'robotic') {
                    stage.removeObstacle(obstacle);
                } else {
                    if (!obstacle.colliding) {
                        obstacle.colliding = true;
                        obstacle.collidedCnt++;
                    }
                    if (obstacle.collidedCnt >= 3) {
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


    tick(delta: number) {
        // 1. check if the character is colliding with any of the items, this may cause logic to change
        // 2. check if the character is colliding with any of the obstacles, this may cause logic to change
        // 3. check if the character is to be colliding with ground, and use this to update the character's movable direction



        this.stages[this.stageidx].updateNearestList(this.character.mesh.position.clone(), 20);
        this.stages[this.stageidx].tick(delta);
        this.checkCollisionObstacles(this.stages[this.stageidx]);
        this.checkCollisionItems(this.stages[this.stageidx]);
        console.log(this.stageidx);
        if (this.stageidx > 0) {
            this.stages[this.stageidx - 1].tick(delta);
            this.stages[this.stageidx - 1].updateNearestList(this.character.mesh.position.clone(), 20);
            this.checkCollisionObstacles(this.stages[this.stageidx - 1]);
            this.checkCollisionItems(this.stages[this.stageidx - 1]);
        }
        this.getCharactorMovableBoundary();
        this.checkToChangeStage();

        this.totalTime += delta;
        const distanceValueElement = document.getElementById('distance-value');
        if (distanceValueElement) {
            distanceValueElement.textContent = this.character.mesh.position.z.toFixed(2); // Display z position rounded to 2 decimals
        }
        this.enemy.tick(delta);
        this.enemyPos += this.enemyVel * delta;
        this.enemyPos = Math.max(this.enemyPos, this.character.mesh.position.z - 40);
        this.enemy.setPosition(0, 0, this.enemyPos);
        console.log("enemy pos: ", this.enemyPos, "char pos: ", this.character.mesh.position.z);
        console.log("enemy pos: ", this.enemy.getBottomCenter());
        // if(this.enemyPos > this.character.mesh.position.z){
        //     document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by enemy' } }));
        // }
        if (checkCollision(this.character, this.enemy)) {
            document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by enemy' } }));
        }
    }

}
export { Controller };