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
    theme: string = 'normal';
    themes: string[] = ['normal', 'TSCP', 'food', 'car', 'house', 'scary'];
    length: number = 200;  

    scene: THREE.Scene;

    nearestObstacles: BaseObstacle[] = [];
    obstaclePointerL: number = 0;
    obstaclePointerR: number = 0;
    nearestItems: BaseItem[] = [];
    itemPointerL: number = 0;
    itemPointerR: number = 0;

    static readonly LENGTH = 200;
    static readonly WIDTH = 5;
    static readonly HEIGHT = 10;
    static readonly START_Z = 0;

    constructor(scene: Scene, name: string, stageNumber: number, 
        obstacleGenerator: ObstacleGenerator, itemGenerator: ItemGenerator, theme='all') {

        const stageGroup = new THREE.Group();
        super('stage', name, stageGroup);
        this.mesh = stageGroup;
        this.length = Stage.LENGTH;
        if(theme=='all')
            this.theme = this.themes[Math.floor(Math.random() * this.themes.length)];
        else 
            this.theme = theme;
        console.log('theme:',this.theme);

        const stagePosition = this.length * stageNumber;
        this.scene = scene.getScene();
        this.scene.add(this.mesh);

        this.ground = new Ground('ground', Stage.WIDTH, this.length);
        this.leftWall = new Wall('leftWall', Stage.LENGTH, this.length);
        this.rightWall = new Wall('rightWall', Stage.LENGTH, this.length);
        this.ceiling = new Ceiling('ceiling', Stage.WIDTH, this.length);
        this.obstacleGenerator = obstacleGenerator;
        this.itemGenerator = itemGenerator;

        this.ground.mesh.position.z = this.length/2;
        this.leftWall.mesh.position.z = this.length/2;
        this.rightWall.mesh.position.z = this.length/2;
        this.ceiling.mesh.position.z = this.length/2;


        this.leftWall.setAsLeftWall();
        this.rightWall.setAsRightWall();
        this.ceiling.setCeiling(Stage.HEIGHT);

        this.mesh.add(this.ground.mesh);
        this.mesh.add(this.leftWall.mesh);
        this.mesh.add(this.rightWall.mesh);
        this.mesh.add(this.ceiling.mesh);

        this.initStage();
        this.initObstacles(this.length, Stage.WIDTH);
        this.initItems(this.length, Stage.WIDTH);
    }

    initStage() {
    }

    initObstacles(trackLength: number, trackWidth: number) {
        const obstacleSpacing = 2; // Change this to change density
        const numObstacles = Math.floor(trackLength / obstacleSpacing);
        // const numObstacles = 40;

        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.centainObstacle('wooden_fence');
            obstacle.rotate('y', Math.PI / 2)
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = -3.5;
            const y = 0;
            const z = i * obstacleSpacing;

            obstacle.setPosition(x, y, z);
        }
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.centainObstacle('wooden_fence');
            obstacle.rotate('y', -Math.PI / 2)
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = 3.5;
            const y = 0;
            const z = i * obstacleSpacing;

            obstacle.setPosition(x, y, z);
        }
        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.randomObstacle(i, this.theme);
            this.obstacles.push(obstacle);
            this.mesh.add(obstacle.mesh);

            const x = Math.random() * trackWidth - trackWidth / 2;
            const y = 0; // For ground objects
            const z = i * obstacleSpacing + Math.random() * obstacleSpacing;

            obstacle.setPosition(x, y, z);
            // console.log('new obstacle generated', obstacle);
            obstacle.addBoundingBoxHelper(this.scene);
        }
        // delete obstacle close to end
        this.obstacles.sort((a, b) => a.getBottomCenter().z - b.getBottomCenter().z);
        while(this.obstacles.length>0 && this.obstacles[this.obstacles.length-1].getBottomCenter().z > this.length){
            this.obstacles[this.obstacles.length-1].destruct();
            this.obstacles.pop();
        }

        this.obstaclePointerL=0;
        this.obstaclePointerR=1;
    }

    initItems(trackLength: number, trackWidth: number) {
        const itemSpacing = 20; // Change this to change density
        const numItems = Math.floor(trackLength / itemSpacing);
        // const numItems = 10;
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

        this.items.sort((a, b) => a.getBottomCenter().z - b.getBottomCenter().z);
        while(this.items.length>0 && this.items[this.items.length-1].getBottomCenter().z > this.length){
            this.items[this.items.length-1].destruct();
            this.items.pop();
        }
        this.itemPointerL=0;
        this.itemPointerR=1;
    }

    updateNearestList(position: THREE.Vector3, range: number=10) {
        // update nearestObstacles
        while(this.obstaclePointerL>0 && 
            this.obstacles[this.obstaclePointerL-1].getBottomCenter().z > position.z - range){
            this.obstaclePointerL--;
        }
        while (this.obstaclePointerL < this.obstacles.length &&
            this.obstacles[this.obstaclePointerL].getBottomCenter().z < position.z - range) {
            this.obstaclePointerL++;
        }
        while(this.obstaclePointerR < this.obstacles.length && 
            this.obstacles[this.obstaclePointerR].getBottomCenter().z < position.z + range){
            this.obstaclePointerR++;
        }
        while (this.obstaclePointerR >0 && (! this.obstacles[this.obstaclePointerR-1]||
            this.obstacles[this.obstaclePointerR-1].getBottomCenter().z > position.z + range)) {
            this.obstaclePointerR--;
        }
        this.nearestObstacles = this.obstacles.slice(this.obstaclePointerL, this.obstaclePointerR);

        // console.log("nearestObestacles: ",this.nearestObstacles);

        // update nearestItems
        
        while(this.itemPointerL>0 && 
            this.items[this.itemPointerL-1].getBottomCenter().z > position.z - range){
            this.itemPointerL--;
        }
        while (this.itemPointerL < this.items.length &&
            this.items[this.itemPointerL].getBottomCenter().z < position.z - range) {
            this.itemPointerL++;
        }
        while(this.itemPointerR<this.items.length && 
            this.items[this.itemPointerR].getBottomCenter().z < position.z + range){
            this.itemPointerR++;
        }
        while (this.itemPointerR >0 &&(! this.items[this.itemPointerR-1]||
            this.items[this.itemPointerR-1].getBottomCenter().z > position.z + range)) {
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

    reset() {
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
        this.nearestObstacles.forEach((obstacle) => {
            obstacle.tick(delta);
        });
        this.nearestItems.forEach((item) => {
            item.tick(delta);
        });
    }
}

export { Stage };