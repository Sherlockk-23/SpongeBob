import { vec3 } from 'three/webgpu';
const Gravity=vec3(0,0,9.8);

export function updateVelocity(velocity, acceleration, time) {
    return velocity+acceleration*time-Gravity*time;
}