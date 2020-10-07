import Path from 'path';
import fs from 'fs';
import { Map } from './map';
import * as Diff from 'diff';

const input = fs.readFileSync(Path.join(__dirname, '../../../Levels/BigExpedition_one.dat'), 'utf8');

const map = new Map();
map.parse(input);
const output = map.serialize();
const diff = Diff.diffLines(input, output);
console.dir(diff.filter(d => d.added || d.removed));