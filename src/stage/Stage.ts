import * as THREE from 'three';
import { BaseObject } from '../objects/BaseObject';
import { Wall } from '../objects/Wall';
import { Ground } from '../objects/Ground';
import { Ceiling } from "../objects/Ceiling";
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';

class Stage extends BaseObject {

    ground: Ground;
    leftWall: Wall;
    rightWall: Wall;
    ceiling: Ceiling;
    obstacles: BaseObstacle[] = [];

    static readonly LENGHT = 1000;
    static readonly WIDTH = 10;
    static readonly HEIGHT = 10;
    static readonly START_Z = 0;

    constructor(name: string, stageNumber: number) {
        const stageGroup = new THREE.Group();
        super('stage', name, stageGroup);

        const stagePosition = Stage.LENGHT * stageNumber;

        this.ground = new Ground('ground', Stage.LENGHT, Stage.WIDTH);
        this.leftWall = new Wall('leftWall', Stage.HEIGHT, Stage.WIDTH);
        this.rightWall = new Wall('rightWall', Stage.HEIGHT, Stage.WIDTH);
        this.ceiling = new Ceiling('ceiling', Stage.LENGHT, Stage.WIDTH);

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
    }

    initStage() {
    }

    generateObstacles() {
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
}

export { Stage };