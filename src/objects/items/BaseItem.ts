import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import {cloneGLTF} from '../../utils/mesh';
import { BaseCharacter } from '../characters/BaseCharacter';

abstract class BaseItem extends MovableObject {
    constructor(name: string, item_gltf: GLTF) {
        const clonedGLTF = cloneGLTF(item_gltf);
        super('item', name, clonedGLTF);
        this.init();
    }

    init() {
        
    }

    tick(delta: number): void {

        //console.log(this.name, 'is ticking');
        this.animate(delta);
        this.updateBoundingBox();
    }
    abstract applyEffect(character: BaseCharacter): void;
}

class speedupItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
    }

    applyEffect(character: BaseCharacter): void {
        const speedBoostEffect = {
            duration: 5, // 持续时间为5秒
            apply: (char: BaseCharacter) => {
                char.defaultMaxVel *= 2; // 将最大速度增加一倍
            },
            remove: (char: BaseCharacter) => {
                char.defaultMaxVel /= 2; // 恢复原来的最大速度
            }
        };
        character.applyEffect('speedBoost', speedBoostEffect);
    }
}

class roboticItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
    }

    applyEffect(character: BaseCharacter): void {
        const roboticEffect = {
            duration: 7,
            apply: (char: BaseCharacter) => {
                char.updateCondition('robotic');
            },
            remove: (char: BaseCharacter) => {
                char.updateCondition('normal');
            }
        };
        character.applyEffect('robotic', roboticEffect);
    }
}

export { BaseItem, speedupItem, roboticItem };