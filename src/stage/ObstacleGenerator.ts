import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseObstacle } from '../objects/obstacles/BaseObstacle';
import { seededRandom } from '../utils/MathUtils';
import { cloneGLTF } from '../utils/mesh';

function traverseAndSetShadows(object: THREE.Object3D) {
    // this don't work 
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
    themes: string[] = ['all', 'normal', 'bikini_bottom', 'windy_food', 'vehicles', 'dungeon', 'statues', 'food', 'special', 'phantom', 'final'];
    themeDict: { [key: string]: string[] } = {};
    themeDecorateDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};
    rotateDict: { [key: string]: THREE.Vector3 } = {};
    velDict: { [key: string]: THREE.Vector3 } = {};

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
        this.initVelDict();

    }

    initThemes() {
        // 这里各科调distribution !!!
        this.themeDict['normal'] = ['jelly_fish'];
        this.themeDict['phantom'] = ['phantom'];
        this.themeDict['bikini_bottom'] = ['squidwardHouseTSCP', 'pineapple_house', 'lightHouseTSCP', 'krabTSCP', 'bottom', 'chum_bucket'];
        this.themeDict['windy_food'] = ['burger', 'table', 'spatula', 'barrelTSCP'];
        this.themeDict['food'] = ['burger', 'burger', 'table', 'spatula', 'barrelTSCP'];
        this.themeDict['vehicles'] = ['car2', 'bus2TSCP', 'train', 'train', 'boatTSCP', 'train'];
        this.themeDict['dungeon'] = ['tiki_wood', 'tiki_wood', 'tiki_wood', 'tiki_wood', 'tikiToren'];
        this.themeDict['statues'] = ['cat', 'dog', 'cat', 'dog', 'cat', 'dog', 'cat', 'dog', 'shiba', 'rabbit'];
        this.themeDict['final'] = ['car2', 'burger', 'lightHouseTSCP', 'jelly_fish', 'cat', 'dog'];
        this.themeDict['special'] = ['realBob'];


        // decoration dict
        this.themeDecorateDict['normal'] = ['swimmingRing', 'jellyNet', 'jellyfish3'];
        this.themeDecorateDict['food'] = ['krabDollar', 'krabMenu', 'mrKrab', 'krabTable', 'spatula', 'barrelTSCP'];
        this.themeDecorateDict['bikini_bottom'] = ['building1TSCP', 'building2TSCP'];
        this.themeDecorateDict['windy_food'] = ['building1TSCP', 'building2TSCP'];
        this.themeDecorateDict['vehicles'] = ['building1TSCP', 'building2TSCP'];
        this.themeDecorateDict['dungeon'] = ['patrickStatue', 'spongehengeTSCP', 'tomb'];
        this.themeDecorateDict['statues'] = ['cow', 'rabbit'];
        this.themeDecorateDict['final'] = ['mrKrab'];
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
        this.sizeDict['train'] = new THREE.Vector3(2, 3, 10);

        //windy_food
        this.sizeDict['burger'] = new THREE.Vector3(2, 2, 2);
        this.sizeDict['spatula'] = new THREE.Vector3(0.3, 1, 0.3);
        this.sizeDict['barrelTSCP'] = new THREE.Vector3(1, 1, 1);
        this.sizeDict['table'] = new THREE.Vector3(1, 0.5, 1);

        // food
        this.sizeDict['krabDollar'] = new THREE.Vector3(0.1, 1, 2);
        this.sizeDict['krabMenu'] = new THREE.Vector3(3, 3, 0.5);
        this.sizeDict['mrKrab'] = new THREE.Vector3(2, 2.5, 1);
        this.sizeDict['krabSign'] = new THREE.Vector3(1, 3, 1);
        this.sizeDict['krabTable'] = new THREE.Vector3(2, 1, 2);

        //statues
        this.sizeDict['rock'] = new THREE.Vector3(3, 3, 3);
        this.sizeDict['shiba'] = new THREE.Vector3(2, 2, 2);
        this.sizeDict['cat'] = new THREE.Vector3(3, 3, 3);
        this.sizeDict['dog'] = new THREE.Vector3(3, 3, 3);
        this.sizeDict['rabbit'] = new THREE.Vector3(2, 2, 2);
        this.sizeDict['cow'] = new THREE.Vector3(2, 2, 2);


        //dungeon
        this.sizeDict['tikiStand'] = new THREE.Vector3(1.75, 2.5, 1.75);
        this.sizeDict['tikiToren'] = new THREE.Vector3(1.75, 2.75, 1.75);
        this.sizeDict['tiki_wood'] = new THREE.Vector3(1.75, 1.75, 1.75);
        this.sizeDict['phantom'] = new THREE.Vector3(1, 1.5, 1);
        this.sizeDict['spongehengeTSCP'] = new THREE.Vector3(2.4, 3.6, 0.7);
        this.sizeDict['patrickStatue'] = new THREE.Vector3(2, 3, 2);
        this.sizeDict['tomb'] = new THREE.Vector3(2, 2, 2);

        //initial
        this.sizeDict['jelly_fish'] = new THREE.Vector3(1.2, 2, 1.2);

        //normal
        this.sizeDict['jellyNet'] = new THREE.Vector3(1.2, 2.5, 1.2);
        this.sizeDict['jellyfish3'] = new THREE.Vector3(1.5, 2, 1.5);

        // special
        this.sizeDict['realBob'] = new THREE.Vector3(10, 18, 5);


        this.sizeDict['hat'] = new THREE.Vector3(0.2, 0.5, 0.2);
        this.sizeDict['boat'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['karen'] = new THREE.Vector3(0.4, 1, 0.4);
        this.sizeDict['snailClock'] = new THREE.Vector3(1.6, 1.6, 0.8);
        this.sizeDict['house1'] = new THREE.Vector3(1, 2, 1);
        this.sizeDict['clock'] = new THREE.Vector3(2, 5, 2);
        this.sizeDict['bed'] = new THREE.Vector3(1, 1, 2);
        this.sizeDict['tableTSCP'] = new THREE.Vector3(3, 1, 3);
        this.sizeDict['chair1'] = new THREE.Vector3(2, 2, 2);

        this.sizeDict['swimmingRing'] = new THREE.Vector3(1.5, 0.5, 1.5);
        this.sizeDict['checkPoint'] = new THREE.Vector3(1, 3.5, 1);

        //decorations and environment
        this.sizeDict['mill1'] = new THREE.Vector3(5, 5, 5);
        this.sizeDict['mill2'] = new THREE.Vector3(5, 5, 5);
        this.sizeDict['wooden_fence'] = new THREE.Vector3(3, 1.2, 0.1);
        this.sizeDict['building1TSCP'] = new THREE.Vector3(2.5, 5, 2.5);
        this.sizeDict['building2TSCP'] = new THREE.Vector3(3, 6, 3);


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
        this.rotateDict['pineapple_house'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['krabTSCP'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['house1'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['tiki_wood'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['tikiToren'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['jelly_fish'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['jellyNet'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['shiba'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['cat'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['dog'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['rabbit'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['cow'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['phantom'] = new THREE.Vector3(0, Math.PI, 0);


        this.rotateDict['mrKrab'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotateDict['krabPack'] = new THREE.Vector3(0, Math.PI / 2, 0);
        this.rotateDict['krabDollar'] = new THREE.Vector3(0, -Math.PI / 2, 0);
        this.rotateDict['krabMenu'] = new THREE.Vector3(0, Math.PI, 0);

        this.rotateDict['realBob'] = new THREE.Vector3(0, Math.PI, 0);
    }
    initVelDict() {
        this.themeDict['all'].forEach(name => {
            this.velDict[name] = new THREE.Vector3(0, 0, 0);
        });
        this.velDict['train'] = new THREE.Vector3(0, 0, -1.5);
        this.velDict['bus2TSCP'] = new THREE.Vector3(0, 0, -1);
        this.velDict['boatTSCP'] = new THREE.Vector3(1, 0, 0);
        this.velDict['car2'] = new THREE.Vector3(0, 0, -2.5);
        this.velDict['rock'] = new THREE.Vector3(0, -4, 0);
        this.velDict['cat'] = new THREE.Vector3(0, -4, 0);
        this.velDict['dog'] = new THREE.Vector3(0, -4, 0);
        this.velDict['tiki_wood'] = new THREE.Vector3(0, -1, 0);
        // this.velDict['tikiToren'] = new THREE.Vector3(0, -1, 0);
        this.velDict['jelly_fish'] = new THREE.Vector3(1, 0, 0);
        this.velDict['phantom'] = new THREE.Vector3(1, 0, 0);

        this.velDict['realBob'] = new THREE.Vector3(0, 0, -4);

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

        let vel = this.velDict[name].clone();
        // add some random noise to vel
        for (let i = 0; i < 3; i++) {
            let noise = (Math.random() - 0.5) * 1.5;
            if (Math.random() > 0.5) noise = -noise;
            if (name.includes('tiki')) {
                // if(Math.random()>0.8)
                //     noise/=3;
                // else
                //     noise = 0;
                vel.setComponent(i, vel.getComponent(i) * Math.exp(noise));
            }
            // else if(name.includes('realBob')) {
            //     vel.setComponent(i, vel.getComponent(i));
            // }
            else
                vel.setComponent(i, vel.getComponent(i) * Math.exp(noise));
            if (name.includes('phantom') || name.includes('jelly_fish')) {
                if (Math.random() > 0.5) {
                    vel.setComponent(i, -vel.getComponent(i));
                }
            }
        }
        obstacle.vel = vel;

        return obstacle;

    }

    randomDecoration(id: number = -1, theme: string = 'normal', size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        let name: string;
        console.log('parse in  theme ', theme);
        if (!this.themes.includes(theme)) {
            theme = 'normal';
        }
        //name pick randomly from themeDict[theme] by this.seed()
        const { random, newSeed } = seededRandom(this.seed);
        this.seed = newSeed;
        name = this.themeDecorateDict[theme][Math.floor(random * this.themeDecorateDict[theme].length)];
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

        let vel = this.velDict[name].clone();
        // add some random noise to vel
        for (let i = 0; i < 3; i++) {
            let noise = (Math.random() - 0.4) * 1.5;
            if (Math.random() > 0.5) noise = -noise;
            vel.setComponent(i, vel.getComponent(i) * Math.exp(noise));
        }
        obstacle.vel = vel;

        return obstacle;
    }

    centainObstacle(name: string, id: number = -1, size: THREE.Vector3 = NaN): BaseObstacle {
        let obstacle: BaseObstacle;
        obstacle = new BaseObstacle(name + '_' + id, this.gltfDict[name]);
        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        obstacle.rescale(size.x, size.y, size.z);
        //rotate by rotateDict
        if (this.rotateDict[name] == undefined) {
            this.rotateDict[name] = new THREE.Vector3(0, 0, 0);
        }
        obstacle.rotate('x', this.rotateDict[name].x);
        obstacle.rotate('y', this.rotateDict[name].y);
        obstacle.rotate('z', this.rotateDict[name].z);
        if (this.velDict[name] == undefined) {
            this.velDict[name] = new THREE.Vector3(0, 0, 0);
        }
        let vel = this.velDict[name].clone();
        obstacle.vel = vel;
        return obstacle;
    }

}

export { ObstacleGenerator };