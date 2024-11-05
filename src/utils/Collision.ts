import * as THREE from "three";
import { OBB } from "./OBB";
import { BaseCharacter } from "../objects/characters/BaseCharacter";
import { BaseObstacle } from "../objects/obstacles/BaseObstacle";

function checkCollisionCharacterWithObstacle(character: BaseCharacter, obstacle: BaseObstacle) {
    if (!character.bboxParameter || !obstacle.bboxParameter) {
        console.error("Bounding box parameter not found");
        return false;
    }

    console.log("Checking collision between", character.name, "and", obstacle.name);
    const { width, height, depth } = character.bboxParameter;
    const characterOBB = new OBB(
        character.mesh.position,
        new THREE.Vector3(width / 2, height / 2, depth / 2),
        new THREE.Matrix3().setFromMatrix4(character.mesh.matrix)
    );

    const { width: obsWidth, height: obsHeight, depth: obsDepth } = obstacle.bboxParameter;
    const obstacleOBB = new OBB(
        obstacle.mesh.position,
        new THREE.Vector3(obsWidth / 2, obsHeight / 2, obsDepth / 2),
        new THREE.Matrix3().setFromMatrix4(obstacle.mesh.matrix)
    );
    console.log(characterOBB, obstacleOBB);

    return characterOBB.intersectsOBB(obstacleOBB);
}


export { checkCollisionCharacterWithObstacle };
