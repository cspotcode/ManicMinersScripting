export function range(a: number, b?: number) {
    if(b === undefined) {
        b = a;
        a = 0;
    }
    const ret = [];
    for(let i = a; i < b; i++) {
        ret.push(i);
    }
    return ret;
}

export function min(a: number, b: number) {
    return Math.min(a, b);
}

export function max(a: number, b: number) {
    return Math.max(a, b);
}

export function input() {
    throw new Error('not implemented');
}