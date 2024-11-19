import * as THREE from 'three';
import { BaseObject, MovableObject } from '../objects/BaseObject';
import { Scene } from '../scenes/Scene';
import { Wall } from '../objects/Wall';
import { Ground } from '../objects/Ground';
import { Ceiling } from "../objects/Ceiling";
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { BaseItem } from '../objects/items/BaseItem';
import { ObstacleGenerator } from '../utils/ObstacleGenerator';
import { ItemGenerator } from '../utils/ItemGenerator';

class Stage extends MovableObject {

    ground: Ground;
    leftWall: Wall;
    rightWall: Wall;
    ceiling: Ceiling;
    obstacles: BaseObstacle[] = [];
    obstacleGenerator: ObstacleGenerator;
    items: BaseItem[] = [];
    itemGenerator: ItemGenerator;
    theme: string = 'all';

    scene: THREE.Scene;

    nearestObstacles: BaseObstacle[] = [];
    obstaclePointerL: number = 0;
    obstaclePointerR: number = 0;
    nearestItems: BaseItem[] = [];
    itemPointerL: number = 0;
    itemPointerR: number = 0;

    static readonly LENGTH = 100;
    static readonly WIDTH = 5;
    static readonly HEIGHT = 10;
    static readonly START_Z = 0;

    constructor(scene: Scene, name: string, stageNumber: number, obstacleGenerator: ObstacleGenerator, itemGenerator: ItemGenerator) {
        const stageGroup = new THREE.Group();
        super('stage', name, stageGroup);
        this.mesh=stageGroup;

        const stagePosition = Stage.LENGTH * stageNumber;
        this.scene = scene.getScene();

        this.ground = new Ground('ground', Stage.WIDTH, Stage.LENGTH);
        this.leftWall = new Wall('leftWall', Stage.LENGTH, Stage.HEIGHT);
        this.rightWall = new Wall('rightWall', Stage.LENGTH, Stage.HEIGHT);
        this.ceiling = new Ceiling('ceiling', Stage.WIDTH, Stage.LENGTH);
        this.obstacleGenerator = obstacleGenerator;
        this.itemGenerator = itemGenerator;

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
        this.initObstacles(Stage.LENGTH, Stage.WIDTH);
        this.initItems(Stage.LENGTH, Stage.WIDTH);
    }

    initStage() {
    }

    initObstacles(trackLength: number, trackWidth: number) {
        const obstacleSpacing = 2; // Change this to change density
        // const numObstacles = Math.floor(trackLength / obstacleSpacing);
        const numObstacles = 20;

        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.centainObstacle('wooden_fence');
            obstacle.rotate('y', Math.PI / 2)
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = -3.5;
            const y = 0;
            const z = i * 3;

            obstacle.setPosition(x, y, z);
        }
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.centainObstacle('wooden_fence');
            obstacle.rotate('y', -Math.PI / 2)
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = 3.5;
            const y = 0;
            const z = i * 3;

            obstacle.setPosition(x, y, z);
        }
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.randomObstacle(i, this.theme);
            obstacle.rotate('y', Math.PI / 2)
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = Math.random() * trackWidth - trackWidth / 2;
            const y = 0; // For ground objects
            const z = i * obstacleSpacing + Math.random() * obstacleSpacing;

            obstacle.setPosition(x, y, z);
            // console.log('new obstacle generated', obstacle);
            obstacle.addBoundingBoxHelper(this.scene);
        }
        this.obstacles.sort((a, b) => a.mesh.position.z - b.mesh.position.z);
        this.obstaclePointerL=0;
        this.obstaclePointerR=1;
    }

    initItems(trackLength: number, trackWidth: number) {
        const itemSpacing = 10; // Change this to change density
        // const numItems = Math.floor(trackLength / itemSpacing);
        const numItems = 10;
        for (let i = 0; i < numItems; i++) {
            const item = this.itemGenerator.randomItem(i, this.theme);
            this.items.push(item);
            this.mesh.add(item.mesh);

            const x = Math.random() * trackWidth - trackWidth / 2;
            const y = 0; // For ground objects
            const z = i * itemSpacing + Math.random() * itemSpacing;

            item.setPosition(x, y, z);
            item.addBoundingBoxHelper(this.scene);
        }

        this.items.sort((a, b) => a.mesh.position.z - b.mesh.position.z);
        this.itemPointerL=0;
        this.itemPointerR=1;
    }

    updateNearestList(position: THREE.Vector3, range: number=10) {
        // update nearestObstacles
        while(this.obstaclePointerL>0 && 
            this.obstacles[this.obstaclePointerL-1].mesh.position.z > position.z - range){
            this.obstaclePointerL--;
        }
        while (this.obstaclePointerL < this.obstacles.length &&
            this.obstacles[this.obstaclePointerL].mesh.position.z < position.z - range) {
            this.obstaclePointerL++;
        }
        while(this.obstaclePointerR < this.obstacles.length && 
            this.obstacles[this.obstaclePointerR].mesh.position.z < position.z + range){
            this.obstaclePointerR++;
        }
        while (this.obstaclePointerR >0 && (! this.obstacles[this.obstaclePointerR-1]||
            this.obstacles[this.obstaclePointerR-1].mesh.position.z > position.z + range)) {
            this.obstaclePointerR--;
        }
        this.nearestObstacles = this.obstacles.slice(this.obstaclePointerL, this.obstaclePointerR);

        // console.log("nearestObestacles: ",this.nearestObstacles);

        // update nearestItems
        
        while(this.itemPointerL>0 && 
            this.items[this.itemPointerL-1].mesh.position.z > position.z - range){
            this.itemPointerL--;
        }
        while (this.itemPointerL < this.items.length &&
            this.items[this.itemPointerL].mesh.position.z < position.z - range) {
            this.itemPointerL++;
        }
        while(this.itemPointerR<this.items.length && 
            this.items[this.itemPointerR].mesh.position.z < position.z + range){
            this.itemPointerR++;
        }
        while (this.itemPointerR >0 &&(! this.items[this.itemPointerR-1]||
            this.items[this.itemPointerR-1].mesh.position.z > position.z + range)) {
            this.itemPointerR--;
        }
        this.nearestItems = this.items.slice(this.itemPointerL, this.itemPointerR);
        // console.log("nearestItems: ",this.nearestItems);
    }

    removeItem(item: BaseItem) {
        this.items = this.items.filter((i) => i !== item);
        item.destruct(this.scene);
    }
    removeObstacle(obstacle: BaseObstacle) {
        this.obstacles = this.obstacles.filter((i) => i !== obstacle);
        obstacle.destruct(this.scene);
    }

    destruct() {
        this.ground.destruct();
        this.leftWall.destruct();
        this.rightWall.destruct();
        this.ceiling.destruct();

        this.obstacles.forEach((obstacle) => {
            obstacle.destruct();
        });
        this.items.forEach((item) => {
            item.destruct();
        });

        super.destruct();
    }

    reset(){
        this.obstacles.forEach((obstacle) => {
            obstacle.destruct();
        });
        this.items.forEach((item) => {
            item.destruct();
        });
        this.obstacles = [];
        this.items = [];
        this.initObstacles(Stage.LENGTH, Stage.WIDTH);
        this.initItems(Stage.LENGTH, Stage.WIDTH);
    }

    tick(delta: number) {
        // this.obstacles.forEach((obstacle) => {
        //     obstacle.tick(delta);
        // });
        // this.items.forEach((item) => {
        //     item.tick(delta);
        // });
        this.obstacles.forEach((obstacle) => {
            obstacle.tick(delta);
        });
        this.items.forEach((item) => {
            item.tick(delta);
        });
    }
}

export { Stage };