import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loop } from './utils/Loop';

import { BaseCharacter } from './objects/characters/BaseCharacter';

import { BaseObstacle } from './objects/obstacles/BaseObstacle';

import { BaseObject } from './objects/BaseObject.ts';

import{ Stage } from './stage/Stage.ts';

import { Ground } from './objects/Ground.ts';

import { updateMovableBoundary } from './utils/Collision.ts';

class Controller{
    //when we have realize Stage
    stage: Stage;
    character : BaseCharacter;
    constructor(stage: Stage, character: BaseCharacter){
        this.stage = stage;
        this.character = character;
        this.init();
    }

    // // fisrt use obstacles directly
    // obstacles: BaseObstacle[];
    // ground: Ground;
    // character: BaseCharacter;
    // constructor(obstacles: BaseObstacle[], ground:Ground, character: BaseCharacter){
    //     this.obstacles = obstacles;
    //     this.character = character;
    //     this.ground = ground;
    //     this.init();
    // }

    
    init(){
        
    }

    updateCharactorMovableBoundary(){
        let movableBoundary : { [key: string]: number } = {
            'forward': 1000,
            'backward': -1000,
            'left': -1000,
            'right': 1000,
            'up': 1000,
            'down': 0
        };
        for(let obstacle of this.stage.obstacles){
            updateMovableBoundary(this.character, obstacle, movableBoundary);
        }
        movableBoundary['up']=Math.min(movableBoundary['up'], this.stage.ceiling.mesh.position.y);
        movableBoundary['down']=Math.max(movableBoundary['down'], this.stage.ground.mesh.position.y);
        movableBoundary['left']=Math.max(movableBoundary['left'], this.stage.leftWall.mesh.position.x);
        movableBoundary['right']=Math.min(movableBoundary['right'], this.stage.rightWall.mesh.position.x);
        this.character.movableBoundary = movableBoundary;
        console.log(this.character.movableBoundary);
    }

    tick(delta: number){
        // 1. check if the character is colliding with any of the items, this may cause logic to change
        // 2. check if the character is colliding with any of the obstacles, this may cause logic to change
        // 3. check if the character is to be colliding with ground, and use this to update the character's movable direction
        this.updateCharactorMovableBoundary();
    
    }

}
export { Controller };