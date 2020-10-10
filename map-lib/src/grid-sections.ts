import { Grid } from "./grid";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";

export class TilesSection extends AbstractMapSection {
    readonly name = MapSectionName.tiles;
    readonly grid = new Grid(0);
    parse(content: string) {
        parseCsvToGrid(content, this.grid);
    }
    serialize(): string {
        return `${ serializeCsv(this.grid) }${ NEWLINE }`;
    }
}
export class HeightSection extends AbstractMapSection {
    readonly name = MapSectionName.height;
    readonly grid = new Grid(0);
    parse(content: string) {
        parseCsvToGrid(content, this.grid);
    }
    serialize(): string {
        return `${ serializeCsv(this.grid) }${ NEWLINE }`;
    }
}
export class ResourcesSection extends AbstractMapSection {
    readonly name = MapSectionName.resources;
    readonly oreGrid = new Grid(0);
    readonly crystalGrid = new Grid(0);
    parse(content: string) {
        NEWLINE; // referenced here to remind that I should tweak this regexp
        const [, crystalCsv, oreCsv] = content.match(/^crystals:\r\n([\s\S]*)\r\nore:\r\n([\s\S]*)\r\n$/)!;
        parseCsvToGrid(crystalCsv, this.crystalGrid);
        parseCsvToGrid(oreCsv, this.oreGrid);
    }
    serialize(): string {
        return `crystals:${NEWLINE
        }${serializeCsv(this.crystalGrid)}${NEWLINE
        }ore:${NEWLINE
        }${serializeCsv(this.oreGrid)}${NEWLINE
        }`;
    }
}

function parseCsvToGrid(content: string, grid: Grid<number>): void {
    const lines = content.split(NEWLINE).filter(v => v);
    for(let y = 0; y < lines.length; y++) {
        const values = lines[y].split(',');
        // -1 because of trailing comma
        for(let x = 0; x < values.length - 1; x++) {
            grid.set(x, y, parseFloat(values[x]));
        }
    }
}
function serializeCsv(grid: Grid<number>): string {
    return grid.grid.map(row => row.join(',') + ',').join(NEWLINE);
}
