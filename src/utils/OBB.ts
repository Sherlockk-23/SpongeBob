import * as THREE from "three";

class OBB {
    // Position of the OBB's center
    center: THREE.Vector3;

    // Half-sizes of the OBB along each axis
    halfSize: THREE.Vector3;

    // Rotation matrix representing the orientation of the OBB
    rotationMatrix: THREE.Matrix3;

    constructor(center: THREE.Vector3, halfSize: THREE.Vector3, rotationMatrix: THREE.Matrix3) {
        this.center = center;
        this.halfSize = halfSize;
        this.rotationMatrix = rotationMatrix;
    }

    // Method to detect if this OBB intersects with another OBB
    intersectsOBB(other: OBB): boolean {
        // Implementation of the Separating Axis Theorem (SAT) for OBB-OBB intersection

        const rotation = new THREE.Matrix3();
        rotation.multiplyMatrices(this.rotationMatrix, other.rotationMatrix.clone().transpose());

        const translation = other.center.clone().sub(this.center);
        translation.applyMatrix3(this.rotationMatrix);

        for (let i = 0; i < 3; i++) {
            if (!this.testAxis(this.halfSize.getComponent(i), other.halfSize, rotation, translation, i)) {
                return false;
            }
        }

        return true;
    }

    // Method to detect if this OBB intersects with an Axis-Aligned Bounding Box (AABB)
    intersectsBox3(box: THREE.Box3): boolean {
        // Create an OBB for the AABB with a zero rotation matrix
        const boxCenter = box.getCenter(new THREE.Vector3());
        const boxHalfSize = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        const aabbOBB = new OBB(boxCenter, boxHalfSize, new THREE.Matrix3());

        return this.intersectsOBB(aabbOBB);
    }

    private testAxis(
        sizeA: number,
        halfSizeB: THREE.Vector3,
        rotation: THREE.Matrix3,
        translation: THREE.Vector3,
        axisIndex: number
    ): boolean {
        let projectionA = sizeA;
        let projectionB =
            Math.abs(rotation.elements[axisIndex] * halfSizeB.x) +
            Math.abs(rotation.elements[axisIndex + 3] * halfSizeB.y) +
            Math.abs(rotation.elements[axisIndex + 6] * halfSizeB.z);

        return Math.abs(translation.getComponent(axisIndex)) <= projectionA + projectionB;
    }
}

export { OBB };
