import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

async function loadAssets(gltfCharactorDict: { [key: string]: GLTF }, gltfObstacleDict: { [key: string]: GLTF },
    gltfItemDict: { [key: string]: GLTF }, textureDict: { [key: string]: THREE.Texture } = {}) {

    const gltfLoader = new GLTFLoader();

    function gltfPromise(path: string): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            gltfLoader.load(
                path,
                (gltf) => {
                    resolve(gltf);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }
    function traverseAndSetShadows(object: THREE.Object3D) {
        object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true; // Allow the mesh to cast shadows
                mesh.receiveShadow = true; // Allow the mesh to receive shadows
            }
        });
    }


    const obstaclePaths = [
        'lightHouseTSCP',
        // 'busTSCP',
        'bus2TSCP',
        'barrelTSCP',
        'boatTSCP',
        'tableTSCP',
        'spongehengeTSCP',
        'train',
        'burger',
        'bottom',
        'building1TSCP',
        'building2TSCP',
        'bus',
        // 'car1',//not usable
        'swimmingRing',
        'checkPoint',
        'car2',
        'chair1',
        'clock',
        'hat',
        'house1',
        'karen',
        'krabTSCP',
        'patrickStatue',
        'pattyWagon',
        'pineappleHouse',
        'pineappleHouseTSCP',
        'snailClock',
        'spatula',
        'squidwardHouseTSCP',
        'table',
        'wooden_fence',
        'bed',
        'jellyKing',
    ];

    const characterPaths = [
        'spongeBobWalk',
        'roboBob1',
        'roboBob2',
        'doodleBob',
        'spongeBobDraw',
        'phantomBob',
        'realBob',
        'scaryBob1',
        'scaryBob2',
        'spongeBobAll',
        'parickHorse',
        'patrickAll',
        'patrickRobot',
        'roboBob3'
    ];

    const itemPaths = [
        // 'burger',
        // 'checkpoint',
        'infoSign',
        'sauceTSCP',
        'sodaTSCP'
    ];

    const promises: Promise<void>[] = [];



    characterPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/Bobs/${path}/scene.gltf`).then((gltf) => {
                traverseAndSetShadows(gltf.scene);
                gltfCharactorDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });

    obstaclePaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/obstacles/${path}/scene.gltf`).then((gltf) => {
                traverseAndSetShadows(gltf.scene);
                gltfObstacleDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });

    itemPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/items/${path}/scene.gltf`).then((gltf) => {
                traverseAndSetShadows(gltf.scene);
                gltfItemDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });


    const texturePaths = [
        'wood',
        'block',
        'glass',
        'grass',
        'particle',
        'flower',
        'flower2',
    ];


    const textureLoader = new THREE.TextureLoader();


    function texturePromise(path: string): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            textureLoader.load(
                path,
                (texture) => {
                    resolve(texture);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    texturePaths.forEach((path) => {
        promises.push(
            texturePromise(`assets/textures/${path}.png`).then((texture) => {
                textureDict[path] = texture;
                console.log('Loaded texture:', path);
            })
        );
    });




    await Promise.all(promises);

    // sort gltf dict by key
    gltfCharactorDict = Object.keys(gltfCharactorDict).sort().reduce(
        (obj, key) => {
            obj[key] = gltfCharactorDict[key];
            return obj;
        },
        {}
    );
    gltfObstacleDict = Object.keys(gltfObstacleDict).sort().reduce(
        (obj, key) => {
            obj[key] = gltfObstacleDict[key];
            return obj;
        },
        {}
    );



}

export { loadAssets };