import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { seededRandom } from './MathUtils';


class ObstacleGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['all', 'normal', 'TSCP', 'food', 'scary'];
    themeDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};

    constructor(gltfDict: { [key: string]: GLTF }) {
        console.log('generator created');
        this.gltfDict = gltfDict;
        this.init();
    }
    init() {
        this.seed = Date.now();
        //this.seed=0;
        this.themes.forEach(theme => {
            this.themeDict[theme] = [];
        });
        for (let key in this.gltfDict) {
            if (key != 'wooden_fence')
                this.themeDict['all'].push(key);
        }
        this.initSizeDict();
        //TODO : add more themes
    }

    initSizeDict() {
        this.themeDict['all'].forEach(name => {
            this.sizeDict[name] = new THREE.Vector3(1, 1, 1);
        });
        this,
            this.sizeDict['burger'] = new THREE.Vector3(2, 2, 2)//done
        this.sizeDict['hat'] = new THREE.Vector3(0.2, 0.5, 0.2);
        this.sizeDict['spatula'] = new THREE.Vector3(0.3, 1, 0.3);
        this.sizeDict['pineappleHouse'] = new THREE.Vector3(3, 5, 3);
        this.sizeDict['bus'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['boat'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['bottom'] = new THREE.Vector3(2, 0.3, 2);
        this.sizeDict['karen'] = new THREE.Vector3(0.4, 1, 0.4);
        this.sizeDict['car2'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['snailClock'] = new THREE.Vector3(0.8, 0.8, 0.4);
        this.sizeDict['house1'] = new THREE.Vector3(1, 2, 1);
        this.sizeDict['clock'] = new THREE.Vector3(1, 2, 1);
        this.sizeDict['bed'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['chair1'] = new THREE.Vector3(1, 1, 1);
        this.sizeDict['table'] = new THREE.Vector3(1, 0.5, 1);
        this.sizeDict['train'] = new THREE.Vector3(2, 2, 10);
        this.sizeDict['boatTSCP'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['busTSCP'] = new THREE.Vector3(6, 2, 2);
        this.sizeDict['lightHouseTSCP'] = new THREE.Vector3(2, 5, 2);
        this.sizeDict['spongehengeTSCP'] = new THREE.Vector3(1.2, 1.8, 0.35);
        this.sizeDict['tableTSCP'] = new THREE.Vector3(3, 1, 3);
        this.sizeDict['wooden_fence'] = new THREE.Vector3(3, 1.2, 0.1);
        console.log('generator initialized', this.themeDict);
    }

    randomObstacle(id: number = -1, theme: string = 'all', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        let name: string;
        if (!(theme in this.themes)) {
            theme = 'all';
        }
        //name pick randomly from themeDict[theme] by this.seed()
        const { random, newSeed } = seededRandom(this.seed);
        this.seed = newSeed;
        name = this.themeDict[theme][Math.floor(random * this.themeDict[theme].length)];
        obstacle = new BaseObstacle(name + '_' + id, this.gltfDict[name]);

        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        {
            const bbox3 = new THREE.Box3().setFromObject(obstacle.mesh);
            const size = bbox3.getSize(new THREE.Vector3());
            console.log('new obstacle generated', obstacle.name, bbox3);
        }
        if (name == 'busTSCP') {
            obstacle.rotate('y', Math.PI);
        }
        if (name == 'boatTSCP') {
            obstacle.rotate('y', Math.PI / 2);
        }
        if (name == 'spongehengeTSCP') {
            obstacle.rotate('y', Math.PI / 2);
        }
        //obstacle.rotate('y', Math.PI);
        //
        return obstacle;

    }
    centainObstacle(name: string, id: number = -1, size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        obstacle = new BaseObstacle(name + '_' + id, this.gltfDict[name]);
        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        return obstacle;
    }

}

export { ObstacleGenerator };