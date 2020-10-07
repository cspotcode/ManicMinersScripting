import { BuildingsSection } from "./building";
import { MapSections, NEWLINE } from "./map";
import { MinersSection } from "./miner";
import { ObjectivesSection } from "./objective";

export type MapSectionNameUnion = keyof typeof MapSectionName;

export enum MapSectionName {
    comments = 'comments',
    info = 'info',
    tiles = 'tiles',
    height = 'height',
    resources = 'resources',
    objectives = 'objectives',
    buildings = 'buildings',
    landslidefrequency = 'landslidefrequency',
    lavaspread = 'lavaspread',
    miners = 'miners',
    briefing = 'briefing',
    briefingsuccess = 'briefingsuccess',
    briefingfailure = 'briefingfailure',
    vehicles = 'vehicles',
    script = 'script',
    creatures = 'creatures'
}

export type MapSection = CommentsSection | InfoSection | TilesSection | HeightSection | ResourcesSection
    | ObjectivesSection | BuildingsSection | LandslideFrequencySection | LavaSpreadSection
    | MinersSection | BriefingSection | BriefingSuccessSection | BriefingFailureSection | VehiclesSection | ScriptSection | CreaturesSection;

export abstract class AbstractMapSection {
    abstract readonly name: MapSectionNameUnion;
    readonly mapSections: MapSections;
    present: boolean = false;
    constructor(mapSections: MapSections) {
        this.mapSections = mapSections;
    }
    abstract serialize(): string;
    abstract parse(content: string): void;
}

export abstract class TextSection extends AbstractMapSection {
    content: string;
    serialize() {
        return this.content;
    }
    parse(content: string) {
        this.content = content;
    }
}
export class CommentsSection extends TextSection {
    readonly name = MapSectionName.comments;
}
export class ScriptSection extends TextSection {
    readonly name = MapSectionName.script;
}
export class BriefingSection extends TextSection {
    readonly name = MapSectionName.briefing;
}
export class BriefingSuccessSection extends TextSection {
    readonly name = MapSectionName.briefingsuccess;
}
export class BriefingFailureSection extends TextSection {
    readonly name = MapSectionName.briefingfailure;
}
export class CreaturesSection extends TextSection {
    readonly name = MapSectionName.creatures;
}

export abstract class KVSection<T> extends AbstractMapSection {
    readonly rawFields: T = Object.create(null) as any;
    parse(content: string) {
        content.split(NEWLINE).filter(v => v).forEach((line) => {
            const [, key, value] = line.match(/^(.+?)\:(.*)$/);
            this.rawFields[key] = value;
        });
    }
    serialize(): string {
        return Object.entries(this.rawFields).map(([key, value]) =>
            `${key}:${value}`
        ).join(NEWLINE) + NEWLINE;
    }
}

export interface InfoSectionRawFields {
    rowcount: string;
    colcount: string;
    camerapos: string;
    biome: string;
    creator: string;
    erosioninitialwaittime: string;
    erosionscale: string;
    version: string;
    camerazoom: string;
}
export class InfoSection extends KVSection<InfoSectionRawFields> {
    readonly name = MapSectionName.info;
}
export class TilesSection extends TextSection {
    readonly name = MapSectionName.tiles;
}
export class HeightSection extends TextSection {
    readonly name = MapSectionName.height;
}
export class ResourcesSection extends TextSection {
    readonly name = MapSectionName.resources;
}
export class LandslideFrequencySection extends TextSection {
    readonly name = MapSectionName.landslidefrequency;
}
export class LavaSpreadSection extends TextSection {
    readonly name = MapSectionName.lavaspread;
}
export class VehiclesSection extends TextSection {
    readonly name = MapSectionName.vehicles;
}
