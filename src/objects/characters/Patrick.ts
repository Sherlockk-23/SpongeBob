import * as THREE from "three";
import { BaseCharacter } from "./BaseCharacter";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Renderer } from "../../scenes/Renderer";
import { Scene } from "../../scenes/Scene";

class Patrick extends BaseCharacter {
    gltfDict: { [key: string]: GLTF };

    constructor(name: string, characterGLTFDict: { [key: string]: GLTF }) {
        let tmpgltfDict: { [key: string]: GLTF } = {};
        tmpgltfDict['normal'] = characterGLTFDict['patrickAll'];
        super(name, tmpgltfDict['normal']);
        this.gltfDict = tmpgltfDict;
        this.init();
    }

    updateConditionMesh(condition: string): { newgltf: GLTF } {
        let newgltf: GLTF;
        let animationId: number = 0;
        switch (condition) {
            case 'normal':
                newgltf = this.gltfDict['normal'];
                animationId = 0;
                break;
        }
        return newgltf;

    }
    updateMovementAnimation(movement: string): { animationId: number; } {
        let animationId: number = 0;
        switch (movement) {
            case 'idle':
                if (this.condition == 'robotic') {
                    animationId = 9;
                } else if (this.condition == 'normal') {
                    animationId = 13;
                } else
                    animationId = 12;
                break;
            case 'walking':
                if (this.condition == 'robotic') {
                    animationId = 9;
                } else if (this.condition == 'normal') {
                    animationId = 20;
                } else
                    animationId = 0;
                break;
            case 'running':
                if (this.condition == 'robotic') {
                    animationId = 9;
                } else if (this.condition == 'normal') {
                    animationId = 17 & 1;
                } else
                    animationId = 0;
                break;
            case 'jumping':
                if (this.condition == 'robotic') {
                    animationId = 7;
                } else if (this.condition == 'normal') {
                    animationId = 4;
                } else
                    animationId = 0;
                break;
            case 'punching':
                if (this.condition == 'robotic') {
                    animationId = 5;
                } else if (this.condition == 'normal') {
                    animationId = 23;
                } else {
                    animationId = 0;
                }
                break;
            default:
                animationId = 0;
                break;
        }
        return { animationId: animationId };
    }
}

export { Patrick };