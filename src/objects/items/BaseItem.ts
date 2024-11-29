import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { MovableObject } from '../BaseObject';
import { cloneGLTF } from '../../utils/mesh';
import { BaseCharacter } from '../characters/BaseCharacter';

interface Effect {
    duration: number;
    apply: (character: BaseCharacter) => void;
    remove: (character: BaseCharacter) => void;
}

abstract class BaseItem extends MovableObject {
    effect: Effect;

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
        this.effect = {
            duration: 5,
            apply: (char: BaseCharacter) => {
                char.defaultMaxVel *= 2;
            },
            remove: (char: BaseCharacter) => {
                char.defaultMaxVel /= 2;
            }
        };
    }

    applyEffect(character: BaseCharacter): void {
        character.pickEffect('speedBoost', this.effect);
    }
}

class highJumpItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
        this.effect = {
            duration: 10,
            apply: (char: BaseCharacter) => {
                char.defaultMaxJumpVel *= 2; // 将跳跃速度增加50%
            },
            remove: (char: BaseCharacter) => {
                char.defaultMaxJumpVel /= 2;
            }
        };
    }

    applyEffect(character: BaseCharacter): void {
        character.pickEffect('highJump', this.effect);
    }
}

class roboticItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
        this.effect = {
            duration: 10,
            apply: (char: BaseCharacter) => {
                char.updateCondition('robotic');
            },
            remove: (char: BaseCharacter) => {
                char.updateCondition('normal');
            }
        };
    }

    applyEffect(character: BaseCharacter): void {
        character.pickEffect('robotic', this.effect);
    }
}

class confusionItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
        this.effect = {
            duration: 7,
            apply: (char: BaseCharacter) => {
                char.updateCondition('confusion');
            },
            remove: (char: BaseCharacter) => {
                char.updateCondition('normal');
            }
        };
    }

    applyEffect(character: BaseCharacter): void {
        character.pickEffect('confusion', this.effect);
    }
}

class danceItem extends BaseItem {
    constructor(name: string, item_gltf: GLTF) {
        super(name, item_gltf);
        this.effect = {
            duration: 3,
            apply: (char: BaseCharacter) => {
                char.rotate('y', Math.PI);
                char.updateCondition('dance');
            },
            remove: (char: BaseCharacter) => {
                char.rotate('y', -Math.PI);
                char.updateCondition('normal');

            }
        };
    }

    applyEffect(character: BaseCharacter): void {
        character.applyEffect('dance', this.effect);
    }
}

export { BaseItem, speedupItem, roboticItem, highJumpItem, danceItem };