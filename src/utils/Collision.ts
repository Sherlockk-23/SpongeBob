import * as THREE from "three";
import { BaseObject } from "../objects/BaseObject";

function checkCollision(object1: BaseObject, object2: BaseObject): boolean {
    // 获取更新后的包围盒
    const bbox1 = new THREE.Box3().setFromObject(object1.mesh);
    const bbox2 = new THREE.Box3().setFromObject(object2.mesh);

    // 检测碰撞
    return bbox1.intersectsBox(bbox2);
}

export { checkCollision };
