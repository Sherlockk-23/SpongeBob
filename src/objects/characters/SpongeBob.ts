import * as THREE from "three";
import { BaseCharacter } from "./BaseCharacter";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SizeScaling } from '../../utils/SizeScaling';

class SpongeBob extends BaseCharacter {
    constructor(name: string, character_gltf: GLTF) {
        super(name, character_gltf);
        SizeScaling.fitToBox(this.mesh, 1, 1, 1);
    }
}

export { SpongeBob };