import * as THREE from "three";
import { BaseObject } from "../objects/BaseObject";
import { BaseCharacter } from "../objects/characters/BaseCharacter";

function checkCollision(object1: BaseObject, object2: BaseObject): boolean {
    // 获取更新后的包围盒
    const bbox1 = new THREE.Box3().setFromObject(object1.mesh);
    const bbox2 = new THREE.Box3().setFromObject(object2.mesh);

    // 检测碰撞
    return bbox1.intersectsBox(bbox2);
}

function updateMovableBoundary(character: BaseCharacter, obstacle: BaseObject, movableBoundary: { [key: string]: number }): void {
    const obstacleBbox = new THREE.Box3().setFromObject(obstacle.mesh);
    const delta = 0.15;
    for (const direction in movableBoundary) {
        const boundary = movableBoundary[direction];
        // to check if the obstacle will give a tighter boundary
        // that is, if the charactor will collide with the obstacle on the way translating to the boundary
        // if so, set the boundary to the obstacle's boundary alone this direction
        const bbox = new THREE.Box3().setFromObject(character.mesh);
        if (direction == 'forward') {
            if (obstacleBbox.min.z + delta < bbox.max.z) continue;
            bbox.max.z += obstacleBbox.min.z - bbox.max.z + delta;
            bbox.min.z += obstacleBbox.min.z - bbox.min.z + delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.min(obstacleBbox.min.z, movableBoundary[direction]);
            }
        } else if (direction == 'backward') {
            if (obstacleBbox.max.z - delta > bbox.min.z) continue;
            bbox.max.z += obstacleBbox.max.z - bbox.max.z - delta;
            bbox.min.z += obstacleBbox.max.z - bbox.min.z - delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.max(obstacleBbox.max.z, movableBoundary[direction]);
            }
        } else if (direction == 'left') {
            if (obstacleBbox.max.x - delta > bbox.min.x) continue;
            bbox.max.x += obstacleBbox.max.x - bbox.max.x - delta;
            bbox.min.x += obstacleBbox.max.x - bbox.min.x - delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.max(obstacleBbox.max.x, movableBoundary[direction]);
            }
        }
        else if (direction == 'right') {
            if (obstacleBbox.min.x + delta < bbox.max.x) continue;
            bbox.max.x += obstacleBbox.min.x - bbox.max.x + delta;
            bbox.min.x += obstacleBbox.min.x - bbox.min.x + delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.min(obstacleBbox.min.x, movableBoundary[direction]);
            }
        } else if (direction == 'up') {
            if (obstacleBbox.min.y + delta < bbox.max.y) continue;
            bbox.max.y += obstacleBbox.min.y - bbox.max.y + delta;
            bbox.min.y += obstacleBbox.min.y - bbox.min.y + delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.min(obstacleBbox.min.y, movableBoundary[direction]);
            }
        } else if (direction == 'down') {
            if (obstacleBbox.max.y - delta > bbox.min.y) continue;
            bbox.max.y += obstacleBbox.max.y - bbox.max.y - delta;
            bbox.min.y += obstacleBbox.max.y - bbox.min.y - delta;
            if (bbox.intersectsBox(obstacleBbox)) {
                movableBoundary[direction] = Math.max(obstacleBbox.max.y, movableBoundary[direction]);
            }
        }

    }
}


function checkCollisionMesh(object1: BaseObject, object2: BaseObject): boolean {
    const meshes1 = getMeshes(object1.mesh);
    const meshes2 = getMeshes(object2.mesh);

    for (const mesh1 of meshes1) {
        for (const mesh2 of meshes2) {
            if (checkMeshCollision1(mesh1, mesh2)) {
                return true;
            }
        }
    }

    return false;
}

function getMeshes(object: THREE.Object3D): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            meshes.push(child);
        }
    });
    return meshes;
}

function checkMeshCollision1(mesh1: THREE.Mesh, mesh2: THREE.Mesh): boolean {
    const raycaster = new THREE.Raycaster();
    const vertices1 = mesh1.geometry.attributes.position.array;

    for (let i = 0; i < vertices1.length; i += 3) {
        const vertex = new THREE.Vector3(vertices1[i], vertices1[i + 1], vertices1[i + 2]);
        const localVertex = vertex.clone();
        const globalVertex = localVertex.applyMatrix4(mesh1.matrixWorld);
        const directionVector = globalVertex.sub(mesh1.position);

        raycaster.set(mesh1.position, directionVector.clone().normalize());

        const intersects = raycaster.intersectObject(mesh2, true);
        if (intersects.length > 0) {
            return true;
        }
    }

    return false;
}


export { updateMovableBoundary, checkCollision, checkCollisionMesh };
