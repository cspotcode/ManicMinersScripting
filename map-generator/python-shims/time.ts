export {};

const start = Date.now();
export function process_time() {
    return (Date.now() - start) / 1000;
}