export function assert(v: any) {
    if (!v) throw new Error('assertion failed');
}

export function createArrayFilledWith<T>(length: number, value: T): T[] {
    const ret: T[] = [];
    for(let i = 0; i < length; i++) {
        ret.push(value);
    }
    return ret;
}
