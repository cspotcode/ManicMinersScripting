import { Grid } from "./grid";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";

interface Point {
    x: number;
    y: number;
}
export abstract class TimedEventSection extends AbstractMapSection {
    grid = new Grid(-1);
    // TODO tweak backend storage to be faster; current implementation is slow
    readonly timedEvents = new Map<number, Point[]>();
    get(x: number, y: number): number {
        return this.grid.get(x, y);
    }
    /** used to make re-serialization more stable */
    private valueOrder: number[] = [];
    parse(content: string) {
        this.valueOrder = [];
        this.grid.resize(this.mapSections.info.fields.colcount, this.mapSections.info.fields.rowcount);
        this.grid.clear();
        const lines = content.split(NEWLINE).filter(v => v);
        for(const line of lines) {
            const [, valueString, rest] = line.match(/^(.+?):(.*)$/)!;
            const pointStrings = rest.split('/').filter(v => v);
            const value = parseFloat(valueString);
            this.valueOrder.push(value);
            for(const pointString of pointStrings) {
                const [xs, ys] = pointString.split(',');
                this.grid.grid[parseInt(ys)][parseInt(xs)] = value;
            }
        }
    }
    serialize(): string {
        const valueToPointsMapping = new Map<number, Point[]>();
        function getPointsForValue(v: number) {
            let line = valueToPointsMapping.get(v);
            if(!line) {
                valueToPointsMapping.set(v, line = []);
            }
            return line;
        }
        for(const v of this.valueOrder) {
            getPointsForValue(v);
        }
        for(let x = 0; x < this.grid.width; x++) {
            for(let y = 0; y < this.grid.height; y++) {
                const v = this.grid.grid[y][x];
                if(v >= 0) {
                    const arr = getPointsForValue(v);
                    arr.push({x, y});
                }
            }
        }
        let acc = '';
        for(const [value, points] of valueToPointsMapping) {
            if(points.length) {
                acc += `${value}:${points.map(p => `${p.x},${p.y}`).join('/') + '/'}${ NEWLINE }`;
            }
        }
        return acc;
    }
}
export class LandslideFrequencySection extends TimedEventSection {
    readonly name = MapSectionName.landslidefrequency;
}
export class LavaSpreadSection extends TimedEventSection {
    readonly name = MapSectionName.lavaspread;
}
