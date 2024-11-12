export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    // ...其他数学工具函数
}
export function seededRandom(seed: number): { random: number, newSeed: number } {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    const newSeed = (a * seed + c) % m;
    const random = newSeed / m;
    return { random, newSeed };
}