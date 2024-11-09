import * as THREE from "three";


// Utility functions for scaling 3D objects

export class SizeScaling {
    /**
     * Scales an object to fit within specified dimensions while maintaining proportions
     * @param object - The THREE.Object3D to scale
     * @param width - Target width of the bounding box
     * @param height - Target height of the bounding box
     * @param depth - Target depth of the bounding box
     * @returns The calculated scale factor used
     */
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

    /**
     * Scales an object by a uniform factor
     * @param object - The THREE.Object3D to scale
     * @param factor - Scale factor to apply uniformly
     */
    static scaleUniform(object: THREE.Object3D, factor: number): void {
        object.scale.set(factor, factor, factor);
    }

    /**
     * Scales an object non-uniformly along each axis
     * @param object - The THREE.Object3D to scale
     * @param scaleX - Scale factor for X axis
     * @param scaleY - Scale factor for Y axis
     * @param scaleZ - Scale factor for Z axis
     */
    static scaleNonUniform(object: THREE.Object3D, scaleX: number, scaleY: number, scaleZ: number): void {
        object.scale.set(scaleX, scaleY, scaleZ);
    }
}