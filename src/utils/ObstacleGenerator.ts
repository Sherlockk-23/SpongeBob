import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';

class ObstacleGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['normal', 'food','scary'];
    themeDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};

    constructor(gltfDict: { [key: string]: GLTF }) {
        console.log('generator created');
        this.gltfDict = gltfDict;
        this.init();
    }
    init () {
        //this.seed = Date.now();
         this.seed=0;
        this.themes.forEach(theme => {
            this.themeDict[theme] = [];
        });
        for (let key in this.gltfDict) {
            this.themeDict['normal'].push(key);
        }
        this.themeDict['normal'].forEach(name => {
            this.sizeDict[name]=new THREE.Vector3(1,1,1);
        });
        console.log('generator initialized',this.themeDict);
        //TODO : add more themes
    }

    randomObstacle(id:number = -1, theme: string = 'normal', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        let name: string;
        if(!(theme in this.themes)) {
            theme = 'normal';
        }
        //name pick randomly from themeDict[theme]
        name = this.themeDict[theme][Math.floor(Math.random() * this.themeDict[theme].length)];
        obstacle = new BaseObstacle(name+id, this.gltfDict[name]);

        if ( isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        
        return obstacle;
        
    }
}

export { ObstacleGenerator };