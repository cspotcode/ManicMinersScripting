import { assert } from "../misc";

export {};

export function random() {
    return Math.random();
}

export function randint(a: number, b: number) {
    assert(b >= a);
    assert(a === Math.floor(a));
    assert(b === Math.floor(b));
    const range = b - a + 1;
    return Math.min(
        Math.floor(Math.random() * range) + a,
        b
    );
}