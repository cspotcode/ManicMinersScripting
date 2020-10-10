import { sortBy } from "lodash";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";
import { formatNumber, Transform } from "./transform";

export abstract class KVSection<T> extends AbstractMapSection {
    // readonly rawFields: T = Object.create(null) as any;
    abstract readonly parserSerializers: {[K in keyof T]: ParserSerializer<T[K]>};
    abstract readonly fields: T;
    readonly fieldOrder: (keyof T)[] = [];
    parse(content: string) {
        this.fieldOrder.length = 0;
        content.split(NEWLINE).filter(v => v).forEach((line) => {
            const [, key, value] = line.match(/^(.+?)\:(.*)$/)! as [unknown, keyof T, string];
            this.fieldOrder.push(key);
            this.fields[key] = this.parserSerializers[key].parse(this.fields[key], value);
        });
    }
    serialize(): string {
        return sortBy(Object.entries(this.fields), ([field]) => this.fieldOrder.indexOf(field as keyof T) + 1 || Infinity)
            .filter(([field, value]) => value != undefined).map(([_key, value]) => {
                const key = _key as keyof T;
                return `${ key }:${ this.parserSerializers[key].serialize(value) }`;
            }).join(NEWLINE) + NEWLINE;
    }
}
interface ParserSerializer<V> {
    parse(oldValue: V, stringValue: string): V;
    serialize(value: V): string;
}
const floatParserSerializer: ParserSerializer<number> = {
    parse(_old: number, stringValue: string) {
        return parseFloat(stringValue);
    },
    serialize(value: number) {
        return `${value}`;
    }
}
const floatAtLeastOneDecimalPointParserSerializer: ParserSerializer<number> = {
    parse(_old: number, stringValue: string) {
        return parseFloat(stringValue);
    },
    serialize(value: number) {
        let str = `${value}`;
        if(!str.includes('.')) str += '.0';
        return str;
    }
}
const transformParserSerializer: ParserSerializer<Transform> = {
    parse(transform: Transform, stringValue: string) {
        transform.parse(stringValue);
        return transform;
    },
    serialize(transform: Transform) {
        return transform.serialize();
    }
}
const stringParserSerializer: ParserSerializer<string> = {
    parse(_old: string, stringValue: string) {
        return stringValue;
    },
    serialize(value: string) {
        return value;
    }
}

export type Biome = 'lava' | 'ice' | 'rock';
export class InfoSectionFields {
    rowcount!: number;
    colcount!: number;
    camerapos!: Transform;
    biome!: Biome;
    creator!: string | null;
    erosioninitialwaittime!: number;
    erosionscale!: number | null;
    version!: string;
    camerazoom!: number | null;
    oxygen!: string | null;
    levelname!: string | null;
    initialcrystals!: number | null;
    initialore!: number | null;
    spiderchance!: number | null;
    cameraangle!: string | null;
    constructor() {
        clearInfoSectionFields(this);
    }
}
function clearInfoSectionFields(self: InfoSectionFields) {
    self.rowcount = 0;
    self.colcount = 0;
    self.camerapos = new Transform();
    self.biome = 'rock';
    self.creator = 'Untrained Cadet';
    self.erosioninitialwaittime = 10;
    self.erosionscale = null;
    self.version = '2020-05-09-1';
    self.camerazoom = null;
    self.oxygen = null;
    self.levelname = null;
    self.initialcrystals = null;
    self.initialore = null;
    self.spiderchance = null;
    self.cameraangle = null;
}
export class InfoSection extends KVSection<InfoSectionFields> {
    readonly name = MapSectionName.info;
    readonly fields = new InfoSectionFields();
    readonly fieldOrder: (keyof InfoSectionFields)[] = [];
    readonly parserSerializers = {
        rowcount: floatParserSerializer,
        colcount: floatParserSerializer,
        camerapos: transformParserSerializer,
        biome: stringParserSerializer as ParserSerializer<Biome>,
        creator: stringParserSerializer,
        erosioninitialwaittime: floatParserSerializer,
        erosionscale: floatAtLeastOneDecimalPointParserSerializer,
        version: stringParserSerializer,
        camerazoom: floatAtLeastOneDecimalPointParserSerializer,
        oxygen: stringParserSerializer,
        levelname: stringParserSerializer,
        initialcrystals: floatParserSerializer,
        initialore: floatParserSerializer,
        spiderchance: floatAtLeastOneDecimalPointParserSerializer,
        cameraangle: stringParserSerializer
    }
    parse(content: string) {
        clearInfoSectionFields(this.fields);
        super.parse(content);
        this.mapSections.lavaspread.grid.resize(this.fields.colcount, this.fields.rowcount);
        this.mapSections.landslidefrequency.grid.resize(this.fields.colcount, this.fields.rowcount);
        this.mapSections.tiles.grid.resize(this.fields.colcount, this.fields.rowcount);
        this.mapSections.height.grid.resize(this.fields.colcount + 1, this.fields.rowcount + 1);
        this.mapSections.resources.oreGrid.resize(this.fields.colcount, this.fields.rowcount);
        this.mapSections.resources.crystalGrid.resize(this.fields.colcount, this.fields.rowcount);
    }
}
