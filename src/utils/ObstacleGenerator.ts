import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { seededRandom } from './MathUtils';
import { cloneGLTF } from './mesh';

function traverseAndSetShadows(object: THREE.Object3D) {
    object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true; // Allow the mesh to cast shadows
            mesh.receiveShadow = true; // Allow the mesh to receive shadows
        }
    });
}

class ObstacleGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['all', 'normal', 'bikini_bottom', 'food', 'vehicles', 'house', 'statues'];
    themeDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};
    rotateDict: { [key: string]: THREE.Vector3 } = {};

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
        this.initThemes();
        this.initSizeDict();
        this.initRotateDict();

        //TODO : add more themes
    }

    initThemes() {
        // 这里各科调distribution !!!
        this.themeDict['normal'] = ['bottom', 'hat', /*'clock', */'snailClock', 'swimmingRing'];
        this.themeDict['bikini_bottom'] = ['squidwardHouseTSCP', 'pineapple_house', 'lightHouseTSCP', 'krabTSCP', 'bottom', 'chum_bucket'];
        this.themeDict['food'] = ['burger', 'table', 'spatula', 'barrelTSCP', 'barrelTSCP', 'burger', 'burger', 'burger'];
        this.themeDict['vehicles'] = ['car2', 'bus2TSCP', 'train', 'boatTSCP', 'boatTSCP'];
        this.themeDict['house'] = ['house1', 'pineapple_house', 'squidwardHouseTSCP', 'bottom'];
        this.themeDict['statues'] = ['patrickStatue', 'spongehengeTSCP', 'patrickStatue'];
    }

    initSizeDict() {
        this.themeDict['all'].forEach(name => {
            this.sizeDict[name] = new THREE.Vector3(1, 1, 1);
        });
        //bikini bottom
        this.sizeDict['pineapple_house'] = new THREE.Vector3(2, 3, 2);
        this.sizeDict['lightHouseTSCP'] = new THREE.Vector3(2, 5, 2);
        this.sizeDict['squidwardHouseTSCP'] = new THREE.Vector3(2, 4, 2);
        this.sizeDict['chum_bucket'] = new THREE.Vector3(2, 4.5, 2);
        this.sizeDict['krabTSCP'] = new THREE.Vector3(4, 3, 3);
        this.sizeDict['bottom'] = new THREE.Vector3(2, 0.3, 2);

        //vehicles
        this.sizeDict['boatTSCP'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['busTSCP'] = new THREE.Vector3(6, 2, 2);
        this.sizeDict['bus2TSCP'] = new THREE.Vector3(5, 2, 2);
        this.sizeDict['car2'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['train'] = new THREE.Vector3(2, 2.5, 10);


        this.sizeDict['burger'] = new THREE.Vector3(2, 2, 2)
        this.sizeDict['hat'] = new THREE.Vector3(0.2, 0.5, 0.2);
        this.sizeDict['spatula'] = new THREE.Vector3(0.3, 1, 0.3);
        this.sizeDict['boat'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['karen'] = new THREE.Vector3(0.4, 1, 0.4);
        this.sizeDict['snailClock'] = new THREE.Vector3(1.6, 1.6, 0.8);
        this.sizeDict['house1'] = new THREE.Vector3(1, 2, 1);
        this.sizeDict['clock'] = new THREE.Vector3(2, 5, 2);
        this.sizeDict['bed'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['chair1'] = new THREE.Vector3(2, 2, 2);
        this.sizeDict['table'] = new THREE.Vector3(1, 0.5, 1);
        this.sizeDict['spongehengeTSCP'] = new THREE.Vector3(1.2, 1.8, 0.35);
        this.sizeDict['tableTSCP'] = new THREE.Vector3(3, 1, 3);
        this.sizeDict['wooden_fence'] = new THREE.Vector3(3, 1.2, 0.1);
        this.sizeDict['swimmingRing'] = new THREE.Vector3(1.5, 0.5, 1.5);
        this.sizeDict['checkPoint'] = new THREE.Vector3(1, 3.5, 1);
        console.log('generator initialized', this.themeDict);
    }
    initRotateDict() {
        this.themeDict['all'].forEach(name => {
            this.rotateDict[name] = new THREE.Vector3(0, 0, 0);
        });
        this.rotateDict['burger'] = new THREE.Vector3(0, Math.PI / 2, 0);
        this.rotateDict['busTSCP'] = new THREE.Vector3(0, 3 * Math.PI / 2, 0);
        this.rotateDict['bus2TSCP'] = new THREE.Vector3(0, 3 * Math.PI / 2, 0);
        this.rotateDict['boatTSCP'] = new THREE.Vector3(0, Math.PI / 2, 0);
        this.rotateDict['pattywagon'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['car2'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['spongehenge'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['bed'] = new THREE.Vector3(0, 0, 0);
        this.rotateDict['snailClock'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['chair1'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['hat'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['clock'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['patrickStatue'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['squidwardHouseTSCP'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['pineappleHouseTSCP'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['krabTSCP'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['house1'] = new THREE.Vector3(0, Math.PI, 0);

    }

    randomObstacle(id: number = -1, theme: string = 'normal', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        let name: string;
        console.log('parse in  theme ', theme);
        if (!this.themes.includes(theme)) {
            theme = 'normal';
        }
        console.log('trying to randomObstacle from theme ', theme);
        //name pick randomly from themeDict[theme] by this.seed()
        const { random, newSeed } = seededRandom(this.seed);
        this.seed = newSeed;
        name = this.themeDict[theme][Math.floor(random * this.themeDict[theme].length)];
        // console.log('trying to randomObstacle ', name);
        traverseAndSetShadows(cloneGLTF(this.gltfDict[name]).scene);
        obstacle = new BaseObstacle(name + '_' + id, cloneGLTF(this.gltfDict[name]));

        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        {
            const bbox3 = new THREE.Box3().setFromObject(obstacle.mesh);
            const size = bbox3.getSize(new THREE.Vector3());
            console.log('new obstacle generated', obstacle.name, bbox3);
        }

        //rotate by rotateDict
        obstacle.rotate('x', this.rotateDict[name].x);
        obstacle.rotate('y', this.rotateDict[name].y);
        obstacle.rotate('z', this.rotateDict[name].z);

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