import Path from 'path';
import fs from 'fs';
import { Map } from './map';
import * as Diff from 'diff';

const levelsDir = Path.join(__dirname, `../../../Levels`);
const mapNames = fs.readdirSync(levelsDir);

for(const mapName of mapNames) {
    if(mapName.endsWith('.dat')) {
        test(mapName.replace('.dat', ''));
    }
}

// test('BigExpedition_one');
// test('Burning_Rivers');

function test(name: string) {
    console.log(name);
    const input = fs.readFileSync(Path.join(__dirname, `../../../Levels/${ name }.dat`), 'utf8');

    const map = new Map();
    map.parse(input);
    const output = map.serialize();
    const diff = Diff.diffLines(input, output);
    const diffFiltered = diff.filter(d => d.added || d.removed);
    if(diffFiltered.length) {
        // console.dir(diff);
        console.dir(diffFiltered);
        // process.exit(0);
    }
}