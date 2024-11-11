import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

async function loadAssets(gltfCharactorDict: { [key: string]: GLTF }, gltfObstacleDict: { [key: string]: GLTF }) {
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

    const promises: Promise<void>[] = [
        gltfPromise('assets/models/Bobs/spongeBobWalk/scene.gltf').then((gltf) => {
            gltfCharactorDict['spongeBobWalk'] = gltf;
            console.log('Loaded GLTF model:', 'spongeBobWalk', gltf);
        }),
        gltfPromise('assets/models/creatures/parickHorse/scene.gltf').then((gltf) => {
            gltfObstacleDict['parickHorse'] = gltf;
            console.log('Loaded GLTF model:', 'parickHorse', gltf);
        }),
        gltfPromise('assets/models/obstacles/hat/scene.gltf').then((gltf) => {
            gltfObstacleDict['hat'] = gltf;
            console.log('Loaded GLTF model:', 'hat', gltf);
        })
        ,
        gltfPromise('assets/models/obstacles/bed/scene.gltf').then((gltf) => {
            gltfObstacleDict['bed'] = gltf;
            console.log('Loaded GLTF model:', 'bed', gltf);
        })
        ,
        gltfPromise('assets/models/obstacles/bus/scene.gltf').then((gltf) => {
            gltfObstacleDict['bus'] = gltf;
            console.log('Loaded GLTF model:', 'bus', gltf);
        }),
        // gltfPromise('assets/models/obstacles/car1/scene.gltf').then((gltf) => {
        //     gltfObstacleDict['car1'] = gltf;
        //     console.log('Loaded GLTF model:', 'car1', gltf);
        // }),  // this has some bugs
        gltfPromise('assets/models/obstacles/pattyWagon/scene.gltf').then((gltf) => {
            gltfObstacleDict['pattyWagon'] = gltf;
            console.log('Loaded GLTF model:', 'pattyWagon', gltf);
        }),
        gltfPromise('assets/models/obstacles/pineappleHouse/scene.gltf').then((gltf) => {
            gltfObstacleDict['pineappleHouse'] = gltf;
            console.log('Loaded GLTF model:', 'pineappleHouse', gltf);
        }),
        gltfPromise('assets/models/obstacles/spatula/scene.gltf').then((gltf) => {
            gltfObstacleDict['spatula'] = gltf;
            console.log('Loaded GLTF model:', 'spatula', gltf);
        }),
    ];

    await Promise.all(promises);
}

export { loadAssets };