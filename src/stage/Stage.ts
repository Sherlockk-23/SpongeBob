import * as THREE from 'three';
import { BaseObject, MovableObject } from '../objects/BaseObject';
import { Scene } from '../scenes/Scene';
import { Wall } from '../objects/Wall';
import { Ground } from '../objects/Ground';
import { Ceiling } from "../objects/Ceiling";
import { Dome } from '../objects/Dome';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { BaseItem } from '../objects/items/BaseItem';
import { ObstacleGenerator } from './ObstacleGenerator';
import { ItemGenerator } from './ItemGenerator';

const groundoffset = 20;
const MAX_PLACEMENT_ATTEMPTS = 10;

class Stage extends MovableObject {

    ground: Ground;
    leftWall: Wall;
    rightWall: Wall;
    ceiling: Ceiling;
    dome: Dome;
    obstacles: BaseObstacle[] = [];
    obstacleGenerator: ObstacleGenerator;
    items: BaseItem[] = [];
    itemGenerator: ItemGenerator;
    theme: string = 'normal';
    themes: string[] = ['normal', 'bikini_bottom', 'windy_food', 'vehicles', 'house', 'statues'];
    length: number = 200;

    scene: THREE.Scene;

    nearestObstacles: BaseObstacle[] = [];
    obstaclePointerL: number = 0;
    obstaclePointerR: number = 0;
    nearestItems: BaseItem[] = [];
    itemPointerL: number = 0;
    itemPointerR: number = 0;

    textureDict: { [key: string]: THREE.Texture } = {};

    specialIntervals: [number, number, string][] = [];


    static readonly LENGTH = 100;
    static readonly WIDTH = 5;
    static readonly HEIGHT = 15;
    static readonly START_Z = 0;

    constructor(scene: Scene, name: string, stageNumber: number,
        obstacleGenerator: ObstacleGenerator, itemGenerator: ItemGenerator,
        textureDict: { [key: string]: THREE.Texture } = {}, theme = 'all') {

        const stageGroup = new THREE.Group();
        super('stage', name, stageGroup);
        this.textureDict = textureDict;
        this.obstacleGenerator = obstacleGenerator;
        this.itemGenerator = itemGenerator;

        this.mesh = stageGroup;
        this.length = Stage.LENGTH;
        if (theme == 'all')
            this.theme = this.themes[Math.floor(Math.random() * this.themes.length)];
        else
            this.theme = theme;
        this.theme = 'windy_food';
        console.log('theme:', this.theme);

        const stagePosition = this.length * stageNumber;
        this.scene = scene.getScene();
        this.scene.add(this.mesh);

        this.leftWall = new Wall('leftWall', Stage.LENGTH, this.length);
        this.rightWall = new Wall('rightWall', Stage.LENGTH, this.length);
        this.ceiling = new Ceiling('ceiling', Stage.WIDTH, this.length);

        let [texture, texwidth, texheight] = this.theme2texture(this.theme, true);
        this.ground = new Ground('ground', Stage.WIDTH * 10, this.length, texture, texwidth, texheight);

        [texture, texwidth, texheight] = this.theme2texture(this.theme, false);
        this.dome = new Dome('dome', Stage.WIDTH * 5, this.length, texture, texwidth, texheight);


        this.ground.mesh.position.z = this.length / 2 - groundoffset;
        this.leftWall.mesh.position.z = this.length / 2 - groundoffset;
        this.rightWall.mesh.position.z = this.length / 2 - groundoffset;
        this.ceiling.mesh.position.z = this.length / 2 - groundoffset;
        this.dome.mesh.position.z = this.length / 2 - groundoffset;


        this.leftWall.setAsLeftWall();
        this.rightWall.setAsRightWall();
        this.ceiling.setCeiling(Stage.HEIGHT);

        this.mesh.add(this.ground.mesh);
        this.mesh.add(this.leftWall.mesh);
        this.mesh.add(this.rightWall.mesh);
        this.mesh.add(this.ceiling.mesh);
        this.mesh.add(this.dome.mesh);



        this.initStage();
        this.initObstacles(this.length, Stage.WIDTH);
        this.initItems(this.length, Stage.WIDTH);
    }

    theme2texture(theme: string, GroundOrDome: boolean): [THREE.Texture, number, number] {
        let texture: THREE.Texture;
        let texwidth: number;
        let texheight: number;
        if (GroundOrDome) {
            if (theme == 'vehicles') {
                texture = this.textureDict['road'];
                texwidth = 7;
                texheight = 7;
            } else if (theme == 'bikini_bottom') {
                texture = this.textureDict['sand'];
                texwidth = 1;
                texheight = 1;
            } else if (theme == 'food') {
                texture = this.textureDict['wood'];
                texwidth = 2;
                texheight = 2;
            } else {
                texture = this.textureDict['grass'];
                texwidth = 1;
                texheight = 1;
            }
        } else {
            if (theme == 'statues') {
                texture = this.textureDict['flower'];
                texwidth = 10;
                texheight = 10;
            } else if (theme == 'bikini_bottom') {
                texture = this.textureDict['colorful'];
                texwidth = 1;
                texheight = 1;
            } else if (theme == 'food') {
                texture = this.textureDict['block'];
                texwidth = 5;
                texheight = 5;
            }
            else {
                texture = this.textureDict['flower2'];
                texwidth = 10;
                texheight = 10;
            }
        }
        return [texture, texwidth, texheight];
    }

    initStage() {
    }

    private checkCollision(obstacle: BaseObstacle, position: THREE.Vector3): boolean {
        // Create a bounding box for the new obstacle at the proposed position
        const bbox = new THREE.Box3().setFromObject(obstacle.mesh);
        // Adjust bounding box to the proposed position
        bbox.translate(position.clone().sub(obstacle.mesh.position));

        // Add some padding around the bounding box to prevent objects from being too close
        const padding = 0.2; // Adjust this value to control minimum spacing between obstacles
        bbox.min.sub(new THREE.Vector3(padding, padding, padding));
        bbox.max.add(new THREE.Vector3(padding, padding, padding));

        // Check collision with existing obstacles
        for (const existingObstacle of this.obstacles) {
            const existingBbox = new THREE.Box3().setFromObject(existingObstacle.mesh);
            if (bbox.intersectsBox(existingBbox)) {
                return true; // Collision detected
            }
        }

        return false; // No collision
    }

    private findValidPosition(obstacle: BaseObstacle, trackWidth: number, zPos: number, spacing: number): THREE.Vector3 | null {
        for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
            // Generate random position within the track bounds
            const x = Math.random() * trackWidth - trackWidth / 2;
            const y = 0; // For ground objects
            const z = zPos + Math.random() * spacing;

            const position = new THREE.Vector3(x, y, z);

            // Check if this position is valid (no collisions)
            if (!this.checkCollision(obstacle, position)) {
                return position;
            }
        }

        return null; // Could not find valid position after maximum attempts
    }

    initObstacles(trackLength: number, trackWidth: number) {
        const obstacleSpacing = 1.5; // Change this to change density
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


        if (this.theme == 'windy_food') {

            for (let i = 0; i < 5; i++) {
                if (Math.random() >= 0.5) {
                    const x = 6;
                    const y = -0.1;
                    const z = i *  20;
                    if (Math.random() >= 0.5) {
                        const obstacle = this.obstacleGenerator.centainObstacle('mill1');
                        obstacle.rotate('y', Math.PI);
                        this.obstacles.push(obstacle);
                        this.mesh.add(obstacle.mesh);
                        obstacle.setPosition(x, y, z);
                        this.specialIntervals.push([z - this.obstacleGenerator.sizeDict['mill1'].z / 2,
                        z + this.obstacleGenerator.sizeDict['mill1'].z / 2, 'wind_from_left']);
                    }
                    else {
                        const obstacle = this.obstacleGenerator.centainObstacle('mill2');
                        this.obstacles.push(obstacle);
                        this.mesh.add(obstacle.mesh);
                        obstacle.setPosition(x, y, z);
                        this.specialIntervals.push([z - this.obstacleGenerator.sizeDict['mill2'].z / 2,
                        z + this.obstacleGenerator.sizeDict['mill2'].z / 2, 'wind_from_left']);
                    }
                }
                else {
                    const x = -6;
                    const y = -0.1;
                    const z = i * 20;
                    if (Math.random() >= 0.5) {
                        const obstacle = this.obstacleGenerator.centainObstacle('mill1');
                        this.obstacles.push(obstacle);
                        this.mesh.add(obstacle.mesh);
                        obstacle.setPosition(x, y, z);
                        this.specialIntervals.push([z - this.obstacleGenerator.sizeDict['mill1'].z / 2,
                        z + this.obstacleGenerator.sizeDict['mill1'].z / 2, 'wind_from_right']);
                    }
                    else {
                        const obstacle = this.obstacleGenerator.centainObstacle('mill2');
                        obstacle.rotate('y', Math.PI);
                        this.obstacles.push(obstacle);
                        this.mesh.add(obstacle.mesh);
                        obstacle.setPosition(x, y, z);
                        this.specialIntervals.push([z - this.obstacleGenerator.sizeDict['mill2'].z / 2,
                        z + this.obstacleGenerator.sizeDict['mill2'].z / 2, 'wind_from_right']);
                    }
                }
            }
        }


        for (let i = 0; i < numObstacles; i++) {
            const obstacle = this.obstacleGenerator.randomObstacle(i, this.theme);

            // Try to find a valid position for the obstacle
            const position = this.findValidPosition(obstacle, trackWidth, i * obstacleSpacing, obstacleSpacing);

            if (position) {
                this.obstacles.push(obstacle);
                this.mesh.add(obstacle.mesh);
                obstacle.setPosition(position.x, position.y, position.z);
            } else {
                // If we couldn't place the obstacle, clean it up
                obstacle.destruct();
            }
        }
        // delete obstacle close to end
        this.obstacles.sort((a, b) => a.getBottomCenter().z - b.getBottomCenter().z);
        while (this.obstacles.length > 0 && this.obstacles[this.obstacles.length - 1].getBottomCenter().z > this.length) {
            this.obstacles[this.obstacles.length - 1].destruct();
            this.obstacles.pop();
        }

        this.obstaclePointerL = 0;
        this.obstaclePointerR = 1;
    }

    initItems(trackLength: number, trackWidth: number) {
        const itemSpacing = 20; // Change this to change density
        const numItems = Math.floor(trackLength / itemSpacing);
        // const numItems = 10;
        for (let i = 0; i < numItems; i++) {
            const item = this.itemGenerator.randomItem(i, this.theme);
            // const item = this.itemGenerator.centainItem('infoSign', i);
            this.items.push(item);
            this.mesh.add(item.mesh);

            const x = Math.random() * trackWidth - trackWidth / 2;
            const y = 0.5 + Math.random() * 1.5;
            const z = i * itemSpacing + Math.random() * itemSpacing;

            item.setPosition(x, y, z);
            // item.addBoundingBoxHelper(this.scene);
        }

        this.items.sort((a, b) => a.getBottomCenter().z - b.getBottomCenter().z);
        while (this.items.length > 0 && this.items[this.items.length - 1].getBottomCenter().z > this.length) {
            this.items[this.items.length - 1].destruct();
            this.items.pop();
        }
        this.itemPointerL = 0;
        this.itemPointerR = 1;
    }

    updateNearestList(position: THREE.Vector3, range: number = 10) {
        // update nearestObstacles
        while (this.obstaclePointerL > 0 &&
            this.obstacles[this.obstaclePointerL - 1].getBottomCenter().z > position.z - range) {
            this.obstaclePointerL--;
        }
        while (this.obstaclePointerL < this.obstacles.length &&
            this.obstacles[this.obstaclePointerL].getBottomCenter().z < position.z - range) {
            this.obstaclePointerL++;
        }
        while (this.obstaclePointerR < this.obstacles.length &&
            this.obstacles[this.obstaclePointerR].getBottomCenter().z < position.z + range) {
            this.obstaclePointerR++;
        }
        while (this.obstaclePointerR > 0 && (!this.obstacles[this.obstaclePointerR - 1] ||
            this.obstacles[this.obstaclePointerR - 1].getBottomCenter().z > position.z + range)) {
            this.obstaclePointerR--;
        }
        this.nearestObstacles = this.obstacles.slice(this.obstaclePointerL, this.obstaclePointerR);

        // console.log("nearestObestacles: ",this.nearestObstacles);

        // update nearestItems

        while (this.itemPointerL > 0 &&
            this.items[this.itemPointerL - 1].getBottomCenter().z > position.z - range) {
            this.itemPointerL--;
        }
        while (this.itemPointerL < this.items.length &&
            this.items[this.itemPointerL].getBottomCenter().z < position.z - range) {
            this.itemPointerL++;
        }
        while (this.itemPointerR < this.items.length &&
            this.items[this.itemPointerR].getBottomCenter().z < position.z + range) {
            this.itemPointerR++;
        }
        while (this.itemPointerR > 0 && (!this.items[this.itemPointerR - 1] ||
            this.items[this.itemPointerR - 1].getBottomCenter().z > position.z + range)) {
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
        this.nearestObstacles.forEach((obstacle) => {
            obstacle.tick(delta);
        });
        this.nearestItems.forEach((item) => {
            item.tick(delta);
        });
    }
}

export { Stage };