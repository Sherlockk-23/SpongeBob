import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { BaseItem } from '../objects/items/BaseItem';
import { burgerItem } from '../objects/items/BaseItem';
import { seededRandom } from './MathUtils';


class ItemGenerator {
    seed: number = 0;
    gltfDict: { [key: string]: GLTF } = {};
    themes: string[] = ['all','normal','TSCP', 'food','scary'];
    themeDict: { [key: string]: string[] } = {};
    sizeDict: { [key: string]: THREE.Vector3 } = {};

    constructor(gltfDict: { [key: string]: GLTF }) {
        console.log('generator created');
        this.gltfDict = gltfDict;
        this.init();
    }
    init () {
        this.seed = Date.now();
        //this.seed=0;
        this.themes.forEach(theme => {
            this.themeDict[theme] = [];
        });
        for (let key in this.gltfDict) {
            this.themeDict['all'].push(key);
        }
        this.initSizeDict() ;
        //TODO : add more themes
    }

    initSizeDict(){
        this.themeDict['all'].forEach(name => {
            this.sizeDict[name]=new THREE.Vector3(1,1,1);
        });
        console.log('generator initialized',this.themeDict);
    }

    randomItem(id:number = -1, theme: string = 'all', size: THREE.Vector3 = NaN): BaseItem {
        let item: BaseItem;
        let name: string;
        if(!(theme in this.themes)) {
            theme = 'all';
        }
        //name pick randomly from themeDict[theme] by this.seed()
        const { random, newSeed } = seededRandom(this.seed);
        this.seed = newSeed;
        name = this.themeDict[theme][Math.floor(random * this.themeDict[theme].length)];
        item = new burgerItem(name+'_'+id, this.gltfDict[name]);

        if ( isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        item.rescale(size.x, size.y, size.z);
        {
            const bbox3 = new THREE.Box3().setFromObject(item.mesh);
            const size = bbox3.getSize(new THREE.Vector3());
            console.log('new Item generated', item.name, bbox3);
        }
        
        return item;
        
    }
    centainItem(name:string,id:number = -1, size: THREE.Vector3 = NaN): BaseItem {
        let item: BaseItem;
        item = new burgerItem(name+'_'+id, this.gltfDict[name]);
        if ( isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
            size = this.sizeDict[name];
        }
        item.rescale(size.x, size.y, size.z);
        return item;
    }
    
}

export { ItemGenerator };