import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loop } from './utils/Loop';

import { BaseCharacter } from './objects/characters/BaseCharacter';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { BaseObject } from './objects/BaseObject.ts';

import { Stage } from './stage/Stage.ts';

import { Ground } from './objects/Ground.ts';

import { updateMovableBoundary, checkCollision } from './utils/Collision.ts';

class Controller {
    //when we have realize Stage
    stage: Stage;
    character: BaseCharacter;
    constructor(stage: Stage, character: BaseCharacter) {
        this.stage = stage;
        this.character = character;
        this.init();
    }


    init() {

    }

    changeStage(stage: Stage) {
        this.stage = stage;
    }

    updateCharactorMovableBoundary() {
        let movableBoundary: { [key: string]: number } = {
            'forward': 1000,
            'backward': -1000,
            'left': -1000,
            'right': 1000,
            'up': 1000,
            'down': 0
        };
        for (let obstacle of this.stage.obstacles) {
            updateMovableBoundary(this.character, obstacle, movableBoundary);
        }
        movableBoundary['up'] = Math.min(movableBoundary['up'], this.stage.ceiling.mesh.position.y);
        movableBoundary['down'] = Math.max(movableBoundary['down'], this.stage.ground.mesh.position.y);
        movableBoundary['left'] = Math.max(movableBoundary['left'], this.stage.leftWall.mesh.position.x);
        movableBoundary['right'] = Math.min(movableBoundary['right'], this.stage.rightWall.mesh.position.x);
        this.character.movableBoundary = movableBoundary;
        // console.log(this.character.movableBoundary);
    }
    checkCollisionItems() {
        for (let item of this.stage.items) {
            if (checkCollision(this.character, item)) {
                console.log('collision with item', item.name);
                item.applyEffect(this.character);
                this.stage.removeItem(item);
                if(item.name.includes('TSCP')){
                    this.character.updateCondition('dead');
                    document.dispatchEvent(new CustomEvent("gameover", { detail: { item: 'killed by '+ item.name } }));
                }
            }
        }
    }

    checkCollisionObstacles() {
        for (let obstacle of this.stage.obstacles) {
            if (checkCollision(this.character, obstacle)) {
                // document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by '+ obstacle.name } }));
                console.log('collide with ' + obstacle.name);
                if (this.character.condition == 'robotic') {
                    this.stage.removeObstacle(obstacle);
                }
                // if(obstacle.name.includes('TSCP')){
                //     this.character.updateCondition('dead');
                // }else if(obstacle.name.includes('b')){
                //     this.character.updateCondition('robotic');
                // }else if(obstacle.name.includes('c')){
                //     this.character.updateCondition('scary');
                // }else
                //     this.character.updateCondition('normal');
            }
        }
    }


    tick(delta: number) {
        // 1. check if the character is colliding with any of the items, this may cause logic to change
        // 2. check if the character is colliding with any of the obstacles, this may cause logic to change
        // 3. check if the character is to be colliding with ground, and use this to update the character's movable direction
        this.checkCollisionObstacles();
        this.checkCollisionItems();
        this.updateCharactorMovableBoundary();

    }

}
export { Controller };