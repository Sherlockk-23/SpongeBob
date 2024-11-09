import * as THREE from "three";


// Utility functions for scaling 3D objects

export class SizeScaling {
    static fitToBox(object: THREE.Object3D, width: number, height: number, depth: number): number {
        // Calculate current bounding box
        const bbox = new THREE.Box3().setFromObject(object);
        const currentSize = new THREE.Vector3();
        bbox.getSize(currentSize);

        // Calculate scale factors
        const scaleX = width / currentSize.x;
        const scaleY = height / currentSize.y;
        const scaleZ = depth / currentSize.z;

        // Use the smallest scale factor to maintain proportions
        const scaleFactor = Math.min(scaleX, scaleY, scaleZ);

        // Apply the scale
        object.scale.set(scaleFactor, scaleFactor, scaleFactor);

        return scaleFactor;
    }

    static scaleUniform(object: THREE.Object3D, factor: number): void {
        object.scale.set(factor, factor, factor);
    }

    static scaleNonUniform(object: THREE.Object3D, scaleX: number, scaleY: number, scaleZ: number): void {
        object.scale.set(scaleX, scaleY, scaleZ);
    }
}