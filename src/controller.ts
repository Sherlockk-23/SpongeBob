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

import { ObstacleGenerator } from './stage/ObstacleGenerator';
import { ItemGenerator } from './stage/ItemGenerator';
import { BaseEnemy } from './objects/enemies/BaseEnemy.ts';

import { UIController } from './ui.ts';

import { ParticleSystem } from './utils/mesh.ts';


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

    collectedStars: number = 0;

    directionLight: THREE.DirectionalLight;

    uicontroller: UIController;
    private audioManager: AudioManager;

    enterSpecialStageLol: boolean = false;
    alreadyEnteredSpecialStage: boolean = false;

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
        this.stages.push(new Stage(this.scene, 'stage1', 0, this.obstacleGenerator, this.itemGenerator, this.textureDict, this.getTheme()));
        this.stageidx = 0;

        this.enemy = new BaseEnemy('jellyKing', this.obstacleGenerator.gltfDict['fish']);
        this.enemy.rescale(5, 4, 4);
        this.scene.getScene().add(this.enemy.mesh);
        this.enemy.setPosition(0, 0, -20);
        // this.character.mesh.add(this.enemy.mesh);

        this.initFog();
    }

    initFog() {
        this.scene.getScene().fog = new THREE.Fog(0x87CEFA, 0.5, 40);
        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(30, 30, 50);
        directionalLight.castShadow = true; // 使光源投射阴影
        directionalLight.shadow.mapSize.width = 2048; // 阴影映射的宽度
        directionalLight.shadow.mapSize.height = 2048; // 阴影映射的高度
        directionalLight.shadow.camera.near = 0.5; // 阴影摄像机的近剪切面
        directionalLight.shadow.camera.far = 500; // 阴影摄像机的远剪切面
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.directionLight = directionalLight;
        this.scene.getScene().add(this.directionLight);
    }

    getTheme() {
        if (this.enterSpecialStageLol) {
            return 'special';
        }
        if (this.collectedStars < 1)
            return 'normal';
        else if (this.collectedStars < 4)
            return 'food';
        else if (this.collectedStars < 7)
            return 'dungeon';
        else if (this.collectedStars < 11)
            return 'windy_food';
        else if (this.collectedStars < 15)
            return 'vehicles';
        else if (this.collectedStars < 20)
            return 'bikini_bottom';
        else if(this.collectedStars < 25)
            return 'statues';
        else
            return 'final';
    }

    changeStage() {
        console.log('change stage');
        this.stageidx += 1;
        this.stages.push(new Stage(this.scene, 'stage' + (this.stageidx + 1), this.stageidx,
            this.obstacleGenerator, this.itemGenerator, this.textureDict, this.getTheme()));
        this.stages[this.stageidx].mesh.position.z =
            this.stages[this.stageidx - 1].mesh.position.z + this.stages[this.stageidx - 1].length;
        if (this.stageidx > 1) {
            this.stages[this.stageidx - 2].destruct();
        }
    }

    getCharactorMovableBoundary() {
        let movableBoundary: { [key: string]: number } = {
            'forward': 10000,
            'backward': -1000,
            'left': -1000,
            'right': 1000,
            'up': 1000,
            'down': 0
        };
        let stage = this.stages[this.stageidx];
        if (this.character.condition != 'robotic') {
            for (let obstacle of stage.nearestObstacles) {
                updateMovableBoundary(this.character, obstacle, movableBoundary);
            }
        }
        movableBoundary['up'] = Math.min(movableBoundary['up'], stage.ceiling.mesh.position.y);
        movableBoundary['down'] = Math.max(movableBoundary['down'], stage.ground.mesh.position.y);
        movableBoundary['left'] = Math.max(movableBoundary['left'], stage.leftWall.mesh.position.x);
        movableBoundary['right'] = Math.min(movableBoundary['right'], stage.rightWall.mesh.position.x);
        if (this.stageidx > 0)
            stage = this.stages[this.stageidx - 1];
        if (this.character.condition != 'robotic') {
            for (let obstacle of stage.nearestObstacles) {
                updateMovableBoundary(this.character, obstacle, movableBoundary);
            }
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
                } else if (item.name.includes('star')) {
                    this.collectedStars += 1;
                    const starCountElement = document.getElementById('star-count');
                    if (starCountElement) {
                        starCountElement.textContent = this.collectedStars.toFixed(0);
                    }
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
                    if (obstacle.collidedCnt >= obstacle.collidedThreshold) {
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

    checkCollisonPhantom() {
        for (let stage of this.stages) {
            for (let obstacle of stage.nearestObstacles) {
                if (checkCollision(this.character, obstacle) && obstacle.name.includes('phantom')) {
                    const effect = {
                        duration: 3,
                        apply: (char: BaseCharacter) => {
                            char.updateCondition('confusion');
                            this.character.rotate('y', Math.PI);
                        },
                        remove: (char: BaseCharacter) => {
                            char.updateCondition('normal');
                            this.character.rotate('y', Math.PI);
                        }
                    };
                    this.character.applyEffect('confusion', effect);
                }
            }
        }

    }

    checkSquash() {
        for (let stage of this.stages) {
            if (stage.theme == 'statues') {
                for (let obstacle of stage.nearestObstacles) {
                    if (!obstacle.name.includes('dog') && !obstacle.name.includes('cat'))
                        continue;
                    if (this.character.mesh.position.z > stage.mesh.position.z + obstacle.mesh.position.z - 1.5
                        && this.character.mesh.position.z < stage.mesh.position.z + obstacle.mesh.position.z + 1.5
                        && this.character.mesh.position.y < obstacle.getBottomCenter().y
                        && this.character.mesh.position.y > obstacle.getBottomCenter().y - 2
                        && this.character.mesh.position.x > obstacle.mesh.position.x - 1.5
                        && this.character.mesh.position.x < obstacle.mesh.position.x + 1.5
                    ) {
                        const effect = {
                            duration: 3,
                            apply: (char: BaseCharacter) => {
                                char.updateCondition('squashed');
                            },
                            remove: (char: BaseCharacter) => {
                                char.updateCondition('normal');
                            }
                        };
                        this.character.applyEffect('squashed', effect)
                    }
                }
            }
        }
    }

    checkPositionState() {
        for (let stage of this.stages) {
            for (let interval of stage.specialIntervals) {
                if (this.character.mesh.position.z > interval[0] + stage.mesh.position.z
                    && this.character.mesh.position.z < interval[1] + stage.mesh.position.z
                ) {
                    if (interval[2] == 'wind_from_left') {
                        const effect = {
                            duration: 0.3,
                            apply: (char: BaseCharacter) => {
                                char.force.x -= 3;

                            },
                            remove: (char: BaseCharacter) => {
                                char.force.x += 3;
                            }
                        };
                        this.character.applyEffect('windy', effect);

                        const particleSystem = new ParticleSystem();
                        const boxMin = new THREE.Vector3(this.character.mesh.position.x - 5, this.character.mesh.position.y - 5, this.character.mesh.position.z - 5);
                        const boxMax = new THREE.Vector3(this.character.mesh.position.x + 5, this.character.mesh.position.y + 5, this.character.mesh.position.z + 5);
                        particleSystem.createWindEffect(boxMin, boxMax, 50, 0.5, new THREE.Vector3(-2, 0, 0));
                        this.scene.getScene().add(particleSystem.particles);
                        particleSystem.addToUpdateList(this.scene.getScene());
                    }
                    if (interval[2] == 'wind_from_right') {
                        const effect = {
                            duration: 0.3,
                            apply: (char: BaseCharacter) => {
                                char.force.x += 3;
                            },
                            remove: (char: BaseCharacter) => {
                                char.force.x -= 3;
                            }
                        };
                        this.character.applyEffect('windy', effect);
                        const particleSystem = new ParticleSystem();
                        const boxMin = new THREE.Vector3(this.character.mesh.position.x - 5, this.character.mesh.position.y - 5, this.character.mesh.position.z - 5);
                        const boxMax = new THREE.Vector3(this.character.mesh.position.x + 5, this.character.mesh.position.y + 5, this.character.mesh.position.z + 5);
                        particleSystem.createWindEffect(boxMin, boxMax, 50, 0.5, new THREE.Vector3(2, 0, 0));
                        this.scene.getScene().add(particleSystem.particles);
                        particleSystem.addToUpdateList(this.scene.getScene());

                    }
                }
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
        // 更新平行光的位置，使其随着角色的 z 位置移动
        const lightOffset = 10; // 调整平行光距离角色的距离
        this.directionLight.position.set(30, 30, this.character.mesh.position.z + lightOffset);

    }

    checkToEnterSpecialStage() {
        if (this.character.mesh.position.z > 2000)
            this.enterSpecialStageLol = true;
        if (this.character.mesh.position.z < this.enemyPos - 5)
            this.enterSpecialStageLol = true;
        if (this.character.mesh.position.z < -5)
            this.enterSpecialStageLol = true;

        if (this.enterSpecialStageLol && !this.alreadyEnteredSpecialStage) {
            // deconstruct this stage, and construct a special stage
            this.alreadyEnteredSpecialStage = true;
            this.enemyMinVel = this.enemyMaxVel = 0;
            this.enemyPos = -100;
            this.enemy.setPosition(0, 0, this.enemyPos);
            this.enemy.destruct();
            for (let stage of this.stages) {
                this.scene.getScene().remove(stage.mesh);
                stage.destruct();
            }
            this.stages = [];
            const stage = new Stage(this.scene, 'special', 0, this.obstacleGenerator, this.itemGenerator, this.textureDict, 'special');
            stage.mesh.position.z = 0;
            this.character.mesh.position.z = 0;
            this.stages.push(stage);
            this.stageidx = 0;
        }
    }


    tick(delta: number) {
        // 1. check if the character is colliding with any of the items, this may cause logic to change
        // 2. check if the character is colliding with any of the obstacles, this may cause logic to change
        // 3. check if the character is to be colliding with ground, and use this to update the character's movable direction



        this.stages[this.stageidx].updateNearestList(this.character.mesh.position.clone(), 20);
        this.stages[this.stageidx].tick(delta);

        this.checkSquash();
        this.checkPositionState();
        this.checkCollisonPhantom();

        this.checkCollisionObstacles(this.stages[this.stageidx], delta);
        this.checkCollisionItems(this.stages[this.stageidx]);
        // console.log(this.stageidx);
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
        // console.log("enemy vel: ", enemyVel, "char pos: ", this.character.mesh.position.z, "enemy pos: ", this.enemyPos);
        this.enemyPos += enemyVel * delta;
        this.enemyPos = Math.max(this.enemyPos, this.character.mesh.position.z - this.enemyDist);
        this.enemy.setPosition(0, 0, this.enemyPos);

        const enemyBox = new THREE.Box3().setFromObject(this.enemy.mesh);
        const distance = Math.abs(this.character.mesh.position.z - enemyBox.max.z);
        if (distance < 2 && distance > 1.95) {
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


        if (checkCollision(this.character, this.enemy) && !this.enterSpecialStageLol) {
            document.dispatchEvent(new CustomEvent("gameover", { detail: { obstacle: 'killed by enemy' } }));
        }

        this.checkToEnterSpecialStage();

    }

}
export { Controller };