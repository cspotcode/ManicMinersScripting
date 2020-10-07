import { BuildingsSection } from "./building";
import { CommentsSection, InfoSection, AbstractMapSection, ScriptSection, VehiclesSection, BriefingSection, LavaSpreadSection, LandslideFrequencySection, MapSectionNameUnion, TilesSection, HeightSection, ResourcesSection, BriefingSuccessSection, BriefingFailureSection, CreaturesSection, MapSectionName } from "./map-section";
import { MinersSection } from "./miner";
import { ObjectivesSection } from "./objective";

export const NEWLINE = '\r\n';
const sectionSplitRe = /\r\n\}(?:\r\n|$)/;

export class Map {
    readonly sections = new MapSections(this);
    parse(content: string) {
        for(const section of this.sections.sections) {
            section.present = false;
        }
        const sectionInputs = content.split(sectionSplitRe).filter(v => v).map(s => s + NEWLINE);
        for(const sectionInput of sectionInputs) {
            const sectionName = sectionInput.match(/^(\S+)\s*\{/)[1] as MapSectionNameUnion;
            const section = this.sections[sectionName];
            section.present = true;
            section.parse(sectionInput.replace(/^.*\{/, '').replace(NEWLINE, ''));
        }
    }
    serialize() {
        return this.sections.sections.filter(s => s.present).map(s => {
            return `${s.name}{${NEWLINE}${s.serialize()}}${NEWLINE}`;
        }).join('');
    }
}

export class MapSections {
    private map: Map;
    constructor(map: Map) {
        this.map = map;
    }
    readonly comments = new CommentsSection(this);
    readonly info = new InfoSection(this);
    readonly tiles = new TilesSection(this);
    readonly height = new HeightSection(this);
    readonly resources = new ResourcesSection(this);
    readonly objectives = new ObjectivesSection(this);
    readonly buildings = new BuildingsSection(this);
    readonly landslidefrequency = new LandslideFrequencySection(this);
    readonly lavaspread = new LavaSpreadSection(this);
    readonly miners = new MinersSection(this);
    readonly briefing = new BriefingSection(this);
    readonly briefingsuccess = new BriefingSuccessSection(this);
    readonly briefingfailure = new BriefingFailureSection(this);
    readonly vehicles = new VehiclesSection(this);
    readonly script = new ScriptSection(this);
    readonly creatures = new CreaturesSection(this);
    readonly sections: AbstractMapSection[] = [
        this.comments,
        this.info,
        this.tiles,
        this.height,
        this.resources,
        this.objectives,
        this.buildings,
        this.landslidefrequency,
        this.lavaspread,
        this.miners,
        this.briefing,
        this.briefingsuccess,
        this.briefingfailure,
        this.vehicles,
        this.script,
        this.creatures
    ];
}