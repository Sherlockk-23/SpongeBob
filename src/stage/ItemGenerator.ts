import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseItem } from '../objects/items/BaseItem';
import { speedupItem, roboticItem, highJumpItem, danceItem } from '../objects/items/BaseItem';
import { seededRandom } from '../utils/MathUtils';
import { cloneGLTF } from '../utils/mesh';


class ItemGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['all', 'normal', 'bikini_bottom', 'vehicles', 'windy_food', 'statues'];
    themeDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};

    rotationDict: { [key: string]: THREE.Vector3 } = {};

    constructor(gltfDict: { [key: string]: GLTF }) {
        console.log('generator created');
        this.gltfDict = gltfDict;
        this.init();
    }
    init() {
        // this.seed = Date.now();
        this.seed = 0;
        this.themes.forEach(theme => {
            this.themeDict[theme] = [];
        });
        for (let key in this.gltfDict) {
            this.themeDict['all'].push(key);
        }
        this.initSizeDict();
        //TODO : add more themes
    }

    initSizeDict() {
        this.themeDict['all'].forEach(name => {
            this.sizeDict[name] = new THREE.Vector3(1, 1, 1);
            this.rotationDict[name] = new THREE.Vector3(0, 0, 0);
        });
        this.sizeDict['sodaTSCP'] = new THREE.Vector3(0.6, 1, 0.6);
        this.sizeDict['disco_ball'] = new THREE.Vector3(0.7, 0.05, 0.7);
        this.rotationDict['disco_ball'] = new THREE.Vector3(-Math.PI / 3, 0, 0);
        this.sizeDict['sauceTSCP'] = new THREE.Vector3(0.6, 1, 0.6);
        this.sizeDict['infoSign'] = new THREE.Vector3(1, 1, 0.7);
        this.sizeDict['xbox_controller_lp'] = new THREE.Vector3(0.6, 0.6, 0.6);
        this.rotationDict['sodaTSCP'] = new THREE.Vector3(0, Math.PI / 2, 0);
        this.rotationDict['sauceTSCP'] = new THREE.Vector3(0, Math.PI / 2, 0);
        this.rotationDict['infoSign'] = new THREE.Vector3(0, Math.PI, 0);
        this.rotationDict['xbox_controller_lp'] = new THREE.Vector3(0, Math.PI, 0);
        console.log('generator initialized', this.themeDict);
    }

    randomItem(id: number = -1, theme: string = 'all', size: THREE.Vector3 = NaN): BaseItem {
        let item: BaseItem;
        let name: string;
        if (!(theme in this.themes)) {
            theme = 'all';
        }
        //name pick randomly from themeDict[theme] by this.seed()
        // const { random, newSeed } = seededRandom(this.seed);
        // this.seed = newSeed;
        const random = Math.random();
        name = this.themeDict[theme][Math.floor(random * this.themeDict[theme].length)];
        //name = 'guess_box';
        if (name.includes('soda')) {
            item = new speedupItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        } else if (name.includes('xbox')) {
            item = new roboticItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));

        } else if (name.includes('disco')) {
            item = new danceItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        }
        else if (name.includes('sauce')) {
            item = new highJumpItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        }
        else {
            if (random < 0.25) {
                item = new highJumpItem('sodaTSCP' + '_' + id, cloneGLTF(this.gltfDict[name]));
            }
            else if (random < 0.5) {
                item = new speedupItem('sauceTSCP' + '_' + id, cloneGLTF(this.gltfDict[name]));
            }
            else if (random < 0.75) {
                item = new roboticItem('xbox_controller_lp' + '_' + id, cloneGLTF(this.gltfDict[name]));
            }
            else {
                item = new danceItem('discoball' + '_' + id, cloneGLTF(this.gltfDict[name]));
            }
            // console.log('debug random item generated', name, random);
        }

        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        item.rescale(size.x, size.y, size.z);
        {
            const bbox3 = new THREE.Box3().setFromObject(item.mesh);
            const size = bbox3.getSize(new THREE.Vector3());
            console.log('new Item generated', item.name, bbox3);
        }

        item.rotate('x', this.rotationDict[name].x);
        item.rotate('y', this.rotationDict[name].y);
        item.rotate('z', this.rotationDict[name].z);

        return item;

    }
    centainItem(name: string, id: number = -1, size: THREE.Vector3 = NaN): BaseItem {
        let item: BaseItem;
        if (name.includes('soda')) {
            item = new speedupItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        } else if (name.includes('info')) {
            item = new roboticItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        } else {
            item = new highJumpItem(name + '_' + id, cloneGLTF(this.gltfDict[name]));
        }
        if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        item.rescale(size.x, size.y, size.z);
        return item;
    }

}

export { ItemGenerator };