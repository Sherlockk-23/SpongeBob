import * as THREE from 'three';
import { PerspectiveCamera } from './Camera';

class CameraController {
    camera: PerspectiveCamera;
    domElement: HTMLElement;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };

    constructor(camera: PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this.addEventListeners();
    }

    addEventListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) {
            return;
        }

        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };

        const rotationSpeed = 0.005;
        this.camera.camera.rotation.y -= deltaMove.x * rotationSpeed;
        this.camera.camera.rotation.x -= deltaMove.y * rotationSpeed;

        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseWheel(event: WheelEvent) {
        const zoomSpeed = 0.01;
        this.camera.camera.position.z += event.deltaY * zoomSpeed;
    }

    onKeyDown(event: KeyboardEvent) {
        const moveSpeed = 0.1;
        switch (event.key) {
            case 'ArrowUp':
                this.camera.camera.position.z -= moveSpeed;
                break;
            case 'ArrowDown':
                this.camera.camera.position.z += moveSpeed;
                break;
            case 'ArrowLeft':
                this.camera.camera.position.x -= moveSpeed;
                break;
            case 'ArrowRight':
                this.camera.camera.position.x += moveSpeed;
                break;
        }
    }
}

export { CameraController };