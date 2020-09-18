import * as Path from 'path';
import * as fs from 'fs';

export const path = {
    join(a: string, b: string) {
        return Path.join(a, b);
    },
    isfile(filename: string) {
        try {
            return fs.statSync(filename).isFile();
        } catch(e) {
            return false;
        } 
    }
}

export function getcwd() {
    return process.cwd();
}