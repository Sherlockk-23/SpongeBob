import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { seededRandom } from './MathUtils';


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
        this.sizeDict['hat']=new THREE.Vector3(0.2,0.5,0.2);
        this.sizeDict['spatula']=new THREE.Vector3(0.3,1,0.3);
        this.sizeDict['pineappleHouse']=new THREE.Vector3(1.5,2,1.5);
        this.sizeDict['bus']=new THREE.Vector3(1,1,2);
        this.sizeDict['bottom']=new THREE.Vector3(2,0.3,2);
        this.sizeDict['karen']=new THREE.Vector3(0.4,1,0.4);
        this.sizeDict['car2']=new THREE.Vector3(0.4,0.4,1);
        this.sizeDict['snailClock']=new THREE.Vector3(0.4,1,0.4);
        console.log('generator initialized',this.themeDict);
        //TODO : add more themes
    }

    randomObstacle(id:number = -1, theme: string = 'normal', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        let name: string;
        if(!(theme in this.themes)) {
            theme = 'normal';
        }
        //name pick randomly from themeDict[theme] by this.seed()
        const { random, newSeed } = seededRandom(this.seed);
        this.seed = newSeed;
        name = this.themeDict[theme][Math.floor(random * this.themeDict[theme].length)];
        obstacle = new BaseObstacle(name+id, this.gltfDict[name]);

        if ( isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        
        return obstacle;
        
    }
}

export { ObstacleGenerator };