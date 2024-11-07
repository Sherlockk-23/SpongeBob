import * as THREE from "three";
import { OBB } from "./OBB";
import { BaseCharacter } from "../objects/characters/BaseCharacter";
import { BaseObstacle } from "../objects/obstacles/BaseObstacle";

function checkCollisionCharacterWithObstacle(character: BaseCharacter, obstacle: BaseObstacle) {
    if (!character.bboxParameter || !obstacle.bboxParameter) {
        console.error("Bounding box parameter not found");
        return false;
    }

    // 调试信息
    console.log("Checking collision between", character.name, "and", obstacle.name);
    console.log("Character bbox:", character.bboxParameter);
    console.log("Obstacle bbox:", obstacle.bboxParameter);

    const { width, height, depth } = character.bboxParameter;
    const characterOBB = new OBB(
        character.mesh.position,
        new THREE.Vector3(width / 2, height / 2, depth / 2),
        new THREE.Matrix3().identity() // 使用单位矩阵
    );

    const { width: obsWidth, height: obsHeight, depth: obsDepth } = obstacle.bboxParameter;
    const obstacleOBB = new OBB(
        obstacle.mesh.position,
        new THREE.Vector3(obsWidth / 2, obsHeight / 2, obsDepth / 2),
        new THREE.Matrix3().identity() // 使用单位矩阵
    );

    // 调试信息
    console.log("Character OBB:", characterOBB);
    console.log("Obstacle OBB:", obstacleOBB);

    return characterOBB.intersectsOBB(obstacleOBB);
}

export { checkCollisionCharacterWithObstacle };