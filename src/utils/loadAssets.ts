import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

async function loadAssets(gltfDict: { [key: string]: GLTF }) {
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
            gltfDict['spongeBobWalk'] = gltf;
            console.log('Loaded GLTF model:', 'spongeBobWalk', gltf);
        }),
        gltfPromise('assets/models/creatures/parickHorse/scene.gltf').then((gltf) => {
            gltfDict['parickHorse'] = gltf;
            console.log('Loaded GLTF model:', 'parickHorse', gltf);
        })
    ];

    await Promise.all(promises);
}

export { loadAssets };