import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';

class ObstacleGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['normal', 'food','scary'];
    themeDict: { [key: string]: string[] } = {};

    constructor(gltfDict: { [key: string]: GLTF }) {
        this.gltfDict = gltfDict;
        this.init();
    }
    init () {
        // this.seed = Date.now();
        this.seed=0;
        for (let key in this.gltfDict) {
            this.themeDict['normal'].push(key);
        }
    }

    randomObstacle(themes: string = 'normal', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        obstacle = new BaseObstacle('anyname', this.gltfDict['obstacle']);
        if (!isNaN(size.x) && !isNaN(size.y) && !isNaN(size.z)) {
            obstacle.mesh.scale.set(size.x, size.y, size.z);
        }else {
            obstacle.mesh.scale.set(1, 1, 1);
        }
        return obstacle;
        
    }
}