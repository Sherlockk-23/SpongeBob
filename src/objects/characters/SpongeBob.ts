import * as THREE from "three";
import { BaseCharacter } from "./BaseCharacter";
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Renderer } from "../../scenes/Renderer";
import { Scene } from "../../scenes/Scene";

class SpongeBob extends BaseCharacter {
    gltfDict: { [key: string]: GLTF };

    constructor(name: string, characterGLTFDict: { [key: string]: GLTF }) {
        let tmpgltfDict: { [key: string]: GLTF } = {};
        tmpgltfDict['normal'] = characterGLTFDict['spongeBobAll'];
        tmpgltfDict['robotic'] = characterGLTFDict['roboBob1'];
        tmpgltfDict['dead'] = characterGLTFDict['spongeBobDraw'];
        tmpgltfDict['scary'] = characterGLTFDict['scaryBob2'];
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
            case 'robotic':
                newgltf = this.gltfDict['robotic'];
                animationId = 0;
                break;
            case 'dead':
                newgltf = this.gltfDict['dead'];
                animationId = 0;
                break;
            case 'scary':
                newgltf = this.gltfDict['scary'];
                animationId = 0;
                break;
            default:
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
                    animationId = 20;
                } else
                    animationId = 0;
                break;
            case 'dance':
                animationId = 12;
                break;
            case 'walking':
                if (this.condition == 'robotic') {
                    animationId = 9;
                } else if (this.condition == 'normal') {
                    animationId = 32;
                } else
                    animationId = 0;
                break;
            case 'running':
                if (this.condition == 'robotic') {
                    animationId = 9;
                } else if (this.condition == 'normal') {
                    animationId = 28;
                } else
                    animationId = 0;
                break;
            case 'jumping':
                if (this.condition == 'robotic') {
                    animationId = 7;
                } else if (this.condition == 'normal') {
                    animationId = 23;
                } else
                    animationId = 0;
                break;
            case 'punching':
                if (this.condition == 'robotic') {
                    animationId = 5;
                } else if (this.condition == 'normal') {
                    animationId = 30;
                } else
                    animationId = 0;
                break;
            default:
                animationId = 0;
                break;
        }
        return { animationId: animationId };
    }
}

export { SpongeBob };