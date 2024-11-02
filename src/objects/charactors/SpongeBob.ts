import * as THREE from "three";
import {BaseCharactor} from "./BaseCharactor";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

class SpongeBob extends BaseCharactor{
    constructor(name: string, charactor_gltf: GLTF){
        super(name, charactor_gltf);
    }
}

export {SpongeBob};