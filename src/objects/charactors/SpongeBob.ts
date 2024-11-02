import * as THREE from "three";
import {BaseCharactor} from "./BaseCharactor";

class SpongeBob extends BaseCharactor{
    constructor(name: string, charactor_mesh: THREE.Object3D | null ){
        super(name, charactor_mesh);
    }
}

export {SpongeBob};