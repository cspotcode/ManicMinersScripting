import { readFileSync } from 'fs';
import { resolve } from 'path';
import {sortBy, groupBy, values, random, flatten, chunk, padStart} from 'lodash';

const tickTime = 0.02;
const chunkSize = 1;

const lavaTiles = readFileSync(resolve(__dirname, 'lava-tiles.txt'), 'utf-8').trim().split('\n').map(line => line.replace(/,$/, '').split(',').map(v => v === '6' ? 1 : 0));
for(const row of lavaTiles) {
    for(const tile of row) {
        process.stdout.write(tile === 1 ? 'x' : ' ');
    }
    process.stdout.write('\n');
}
// process.exit(0);

const lines = readFileSync(resolve(__dirname, 'lava-flood.txt'), 'utf-8').split('\n').map(v => v.trim()).filter(v => v);

let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
const floodTiles = lines.map(line => {
    const match = line.match(/.*place:(\d+),(\d+),\d+/);
    const y = parseInt(match[1]);
    const x = parseInt(match[2]);
    if(x < minX) minX = x;
    if(y < minY) minY = y;
    if(x > maxX) maxX = x;
    if(y > maxY) maxY = y;
    return {y, x, line, distanceFromLava: 0};
});

const isLavaTile = generate(100).map(v => generate(100));
for(let y = 0; y < lavaTiles.length; y++) {
    const row = lavaTiles[y];
    for(let x = 0; x < row.length; x++) {
        isLavaTile[x][y] = row[x];
    }
}
const isFloodTile = generate(maxX + 1).map(v => generate(maxY + 1));
// Index -1 means is flood tile and has not been assigned a distance
// Index 0 means lava tile
// Index -2 otherwise
const tileDistance = generate(maxX + 2).map(v => generate(maxY + 2).map(v => -2));
// Set all lava tiles to be distance "0" meaning they are lava sources.
for(let y = 0; y < lavaTiles.length; y++) {
    const row = lavaTiles[y];
    for(let x = 0; x < row.length; x++) {
        if(tileDistance[x]?.length > y && row[x]) {
            tileDistance[x][y] = 0;
        }
    }
}
for(const {x, y} of floodTiles) {
    isFloodTile[x][y] = 1;
    tileDistance[x][y] = -1;
}

let tilesAssignedDistance = 0;
let assigningDistance = 1;
while(tilesAssignedDistance < floodTiles.length) {
    for(let y = 0; y <= maxY; y++) {
        for(let x = 0; x <= maxX; x++) {
            if(tileDistance[x][y] === -1 && isAdjacentTo(x, y, assigningDistance - 1)) {
                tileDistance[x][y] = assigningDistance;
                tilesAssignedDistance++;
            }
        }
    }
    assigningDistance++;
    if(assigningDistance > 20) break;
}

for(let y = minY; y <= maxY; y++) {
    for(let x = minX; x <= maxX; x++) {
        const dist = tileDistance[x][y];
        process.stdout.write(`${ padStart(`${ dist < 0 ? ' ' : dist }`, 2, ' ') }-`);
    }
    process.stdout.write('\n');
}
// process.exit(0);

for(const tile of floodTiles) {
    tile.distanceFromLava = tileDistance[tile.x][tile.y];
}
const sortedFloodTiles = flatten(
    sortBy(
        values(
            groupBy(floodTiles, v => v.distanceFromLava)
        ),
        v => v[0].distanceFromLava
    ).map(
        list => sortBy(list, tile => Math.random())
    )
);

const chunkedSortedFloodTiles = chunk(sortedFloodTiles, chunkSize);
for(const chunk of chunkedSortedFloodTiles) {
    for(const tile of chunk) {
        console.log(tile.line);
    }
    console.log(`wait:${tickTime};`);
}

function isAdjacentTo(x: number, y: number, value: number) {
    return (
        // tileDistance[x-1]?.[y-1] === value ||
        tileDistance[x-1]?.[y] === value ||
        // tileDistance[x-1]?.[y+1] === value ||
        tileDistance[x]?.[y-1] === value ||
        tileDistance[x]?.[y+1] === value ||
        // tileDistance[x+1]?.[y-1] === value ||
        tileDistance[x+1]?.[y] === value ||
        // tileDistance[x+1]?.[y+1] === value
        false
    );
}

function generate(length: number) {
    return Array.from(function*() {
        for(let i = 0; i < length; i++)
            yield 0;
    }());
}
