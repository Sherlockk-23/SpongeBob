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
        'barrelTSCP',
        'boatTSCP',
        'bottom',
        'building1TSCP',
        'building2TSCP',
        'burger',
        'bus2TSCP',
        'car2',
        'cat',
        'chair1',
        'checkPoint',
        'chum_bucket',
        'clock',
        'cow',
        'dog',
        'fish',
        'hat',
        'house1',
        'jelly_fish',
        'karen',
        'krabTSCP',
        'lightHouseTSCP',
        'mill1',
        'mill2',
        'patrickStatue',
        'phantom',
        'pillar',
        'pineapple_house',
        'rabbit',
        'rock',
        'realBob',
        'shiba',
        'snailClock',
        'spatula',
        'spongehengeTSCP',
        'squidwardHouseTSCP',
        'swimmingRing',
        'table',
        'tableTSCP',
        'tiki_wood',
        'tikiStand',
        'tikiToren',
        'train',
        'wooden_fence',
        'krabDollar',
        'krabMenu',
        'mrKrab',
        'krabPack',
        'krabTable',
        'jellyNet',
        'jellyfish3',
        'butterfly',
        'tomb'
    ];

    const characterPaths = [
        'roboBob1',
        'roboBob2',
        'doodleBob',
        'spongebobDraw',
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
        // 'infoSign',
        'sauceTSCP',
        'sodaTSCP',
        'disco_ball',
        'guess_box',
        'xbox_controller_lp',
        'star',
    ];

    const promises: Promise<void>[] = [];



    characterPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets_/models/Bobs/${path}/scene.gltf`).then((gltf) => {
                traverseAndSetShadows(gltf.scene);
                gltfCharactorDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });

    obstaclePaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets_/models/obstacles/${path}/scene.gltf`).then((gltf) => {
                traverseAndSetShadows(gltf.scene);
                gltfObstacleDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);

                let verCount = 0;
                gltf.scene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        verCount += mesh.geometry.attributes.position.count;
                    } else {
                        child.traverse((child2) => {
                            if ((child2 as THREE.Mesh).isMesh) {
                                const mesh = child2 as THREE.Mesh;
                                verCount += mesh.geometry.attributes.position.count;
                            }
                        });
                    }
                });

                console.log('Vertex count:', path, verCount);
            })
        );
    });

    itemPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets_/models/Items/${path}/scene.gltf`).then((gltf) => {
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
        'sand',
        'road',
        'ice',
        'colorful',
        'cute',
        'woodwet',
        'artgorl',
        'afiCarpet',
        'afiPat',
        'afiPat1',
        'afiPat2',
        'bears',
        'seaweed',
        'sea1'
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
            texturePromise(`assets_/textures/${path}.png`).then((texture) => {
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