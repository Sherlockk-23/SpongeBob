import * as THREE from 'three';
import { BaseObject, MovableObject } from '../objects/BaseObject';
import { Wall } from '../objects/Wall';
import { Ground } from '../objects/Ground';
import { Ceiling } from "../objects/Ceiling";
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { ObstacleGenerator } from '../utils/ObstacleGenerator';

class Stage extends MovableObject {

    ground: Ground;
    leftWall: Wall;
    rightWall: Wall;
    ceiling: Ceiling;
    obstacles: BaseObstacle[] = [];
    obstacleGenerator: ObstacleGenerator;

    static readonly LENGTH = 1000;
    static readonly WIDTH = 10;
    static readonly HEIGHT = 10;
    static readonly START_Z = 0;

    constructor(name: string, stageNumber: number, obstacleGenerator: ObstacleGenerator) {
        const stageGroup = new THREE.Group();
        super('stage', name, stageGroup);

        const stagePosition = Stage.LENGTH * stageNumber;

        this.ground = new Ground('ground', Stage.WIDTH, Stage.LENGTH);
        this.leftWall = new Wall('leftWall', Stage.LENGTH, Stage.HEIGHT);
        this.rightWall = new Wall('rightWall', Stage.LENGTH, Stage.HEIGHT);
        this.ceiling = new Ceiling('ceiling', Stage.WIDTH, Stage.LENGTH);
        this.obstacleGenerator = obstacleGenerator;

        this.ground.mesh.position.z = stagePosition;
        this.leftWall.mesh.position.z = stagePosition;
        this.rightWall.mesh.position.z = stagePosition;
        this.ceiling.mesh.position.z = stagePosition;

        this.leftWall.setAsLeftWall();
        this.rightWall.setAsRightWall();
        this.ceiling.setCeiling(Stage.HEIGHT);

        this.mesh.add(this.ground.mesh);
        this.mesh.add(this.leftWall.mesh);
        this.mesh.add(this.rightWall.mesh);
        this.mesh.add(this.ceiling.mesh);

        this.initStage();
        this.initObstacles();
    }

    initStage() {
    }

    initObstacles() {
        for (let i = 0; i < 20; i++) {
            const obstacle = this.obstacleGenerator.randomObstacle(i);
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);
            obstacle.setPosition(0, 0, i * 2 + 1);
            console.log(obstacle);
            // obstacle.addBoundingBoxHelper(this.scene.getScene());
            // well this works
        }
    }

    destruct() {
        this.ground.destruct();
        this.leftWall.destruct();
        this.rightWall.destruct();
        this.ceiling.destruct();

        this.obstacles.forEach((obstacle) => {
            obstacle.destruct();
        });

        super.destruct();
    }

    tick(delta: number) {
        this.obstacles.forEach((obstacle) => {
            obstacle.tick(delta);
        });
    }
}

export { Stage };