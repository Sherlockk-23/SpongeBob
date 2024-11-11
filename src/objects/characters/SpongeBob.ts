import * as THREE from "three";
import { BaseCharacter } from "./BaseCharacter";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

class SpongeBob extends BaseCharacter {
    constructor(name: string, character_gltf: GLTF) {
        super(name, character_gltf);
    }
}

export { SpongeBob };