import { BuildingsSection } from "./building";
import { HeightSection, ResourcesSection, TilesSection } from "./grid-sections";
import { InfoSection } from "./info-section";
import { MapSections } from "./map";
import { MinersSection } from "./miner";
import { ObjectivesSection } from "./objective";
import { LandslideFrequencySection, LavaSpreadSection } from "./timed-event-sections";
import { VehiclesSection } from "./vehicle";

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
    content: string = '';
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
