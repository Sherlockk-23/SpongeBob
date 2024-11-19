import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

async function loadAssets(gltfCharactorDict: { [key: string]: GLTF }, gltfObstacleDict: { [key: string]: GLTF },
    gltfItemDict: { [key: string]: GLTF }) {
    const gltfLoader = new GLTFLoader();

    function gltfPromise(path: string): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            gltfLoader.load(
                path,
                (gltf) => {
                    // 标准化模型
                    standardizeModel(gltf.scene);
                    resolve(gltf);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    function standardizeModel(model: THREE.Object3D) {
        return;
        // 计算模型的包围盒
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());

        // 将模型居中
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        // 调整模型的缩放比例
        const maxAxis = Math.max(size.x, size.y, size.z);
        model.scale.multiplyScalar(1.0 / maxAxis);

        // 更新模型的世界矩阵
        model.updateMatrixWorld(true);
    }

    const obstaclePaths = [
        // 'lightHouseTSCP',
        'busTSCP',
        'boatTSCP',
        // 'tableTSCP',
        'spongehengeTSCP',
        // 'train',
        'burger',
        // 'bottom',
        // 'building1TSCP',
        // 'building2TSCP',
        // 'bus'
        // 'car1',//not usable
        // 'car2',
        // 'chair1',
        // 'clock',
        // 'hat',
        // 'house1',
        // 'karen',
        // 'krabTSCP',
        // 'patrickStatue',
        // 'pattyWagon',
        // 'pineappleHouse',
        // 'pineappleHouseTSCP',
        'snailClock',
        // 'spatula',
        // 'squidwardHouseTSCP',
        // 'table'
        'wooden_fence'
        // 'bed',
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
        'spongeBobAll'
    ];

    const itemPaths = [
        // 'burger',
        'checkpoint',
        'infoSign',
        'sauceTSCP',
        'sodaTSCP'
    ];


    const promises: Promise<void>[] = [
        gltfPromise('assets/models/creatures/parickHorse/scene.gltf').then((gltf) => {
            gltfObstacleDict['parickHorse'] = gltf;
            console.log('Loaded GLTF model:', 'parickHorse', gltf);
        })
    ];

    characterPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/Bobs/${path}/scene.gltf`).then((gltf) => {
                gltfCharactorDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });

    obstaclePaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/obstacles/${path}/scene.gltf`).then((gltf) => {
                gltfObstacleDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
            })
        );
    });

    itemPaths.forEach((path) => {
        promises.push(
            gltfPromise(`assets/models/items/${path}/scene.gltf`).then((gltf) => {
                gltfItemDict[path] = gltf;
                console.log('Loaded GLTF model:', path, gltf);
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