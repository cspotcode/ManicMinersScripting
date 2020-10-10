import { BuildingNameUnion } from "./building";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";

export type ObjectiveTypeUnion = 'building' | 'discovertile' | 'findbuilding' | 'resources';
export enum ObjectiveType {
    building = 'building',
    discovertile = 'discovertile',
    findbuilding = 'findbuilding',
    resources = 'resources',
    variable = 'variable'
}

export function createObjectiveFromLine(content: string) {
    const [, type, rest] = content.match(/^(.*?):(.*)/)!;
    const Ctor = ctorLookup[type as ObjectiveTypeUnion];
    const objective = new Ctor();
    objective.parseFields(rest);
    return objective;
}

export abstract class Objective {
    abstract readonly type: ObjectiveType;
    readonly addSpaceAfterColon: boolean = false;
    serialize(): string {
        return `${this.type}:${ this.addSpaceAfterColon ? ' ' : '' }${this.serializeFields()}`;
    }
    abstract serializeFields(): string;
    abstract parseFields(content: string): void;
}

export class BuildingObjective extends Objective {
    readonly type = ObjectiveType.building;
    building!: BuildingNameUnion;
    serializeFields() {
        return this.building;
    }
    parseFields(content: string) {
        this.building = content as BuildingNameUnion;
    }
}

export class DiscoverTileObjective extends Objective {
    readonly type = ObjectiveType.discovertile;
    description: string = '';
    x: number = 0;
    y: number = 0;
    serializeFields() {
        return `${this.x},${this.y}/${this.description}`;
    }
    parseFields(content: string) {
        const [, xs, ys, description] = content.match(/^(\d+),(\d+)\/(.*)$/)!;
        this.x = parseInt(xs);
        this.y = parseInt(ys);
        this.description = description;
    }
}

export class FindBuildingObjective extends Objective {
    readonly type = ObjectiveType.findbuilding;
    x: number = 0;
    y: number = 0;
    serializeFields() {
        return `${this.x},${this.y}`;
    }
    parseFields(c: string) {
        const [xs, ys] = c.split(',');
        this.x = parseInt(xs);
        this.y = parseInt(ys);
    }
}

export class ResourcesObjective extends Objective {
    readonly type = ObjectiveType.resources;
    readonly addSpaceAfterColon = true;
    crystals: number = 0;
    ore: number = 0;
    studs: number = 0;
    serializeFields() {
        return `${this.crystals},${this.ore},${this.studs}`;
    }
    parseFields(content: string) {
        const [crystalS, oreS, studS] = content.split(',');
        this.crystals = parseInt(crystalS);
        this.ore = parseInt(oreS);
        this.studs = parseInt(studS);
        return `${this.crystals},${this.ore},${this.studs}`;
    }
}

export class VariableObjective extends Objective {
    readonly type = ObjectiveType.variable;
    conditional: string = '';
    description: string = '';
    serializeFields() {
        return `${this.conditional}/${this.description}`;
    }
    parseFields(content: string) {
        const [, conditional, description] = content.match(/^(.*?)\/(.*)$/)!;
        this.conditional = conditional;
        this.description = description;
    }
}

/*
building:BuildingDocks_C
discovertile:2,48/Lost Rockraiders 1
discovertile:5,15/Get to the lost minigbase and start working
building:BuildingGeologicalCenter_C
building:BuildingUpgradeStation_C
building:BuildingOreRefinery_C
findbuilding:39,3
discovertile:30,22/Jürgen got lost searching for Energykristals
resources: 250,0,0
resources: 0,500,120
*/

const ctorLookup = {
    building: BuildingObjective,
    discovertile: DiscoverTileObjective,
    findbuilding: FindBuildingObjective,
    resources: ResourcesObjective,
    variable: VariableObjective
}

export class ObjectivesSection extends AbstractMapSection {
    readonly name = MapSectionName.objectives;
    readonly objectives: Objective[] = [];
    parse(c: string) {
        const objectiveLines = c.split(NEWLINE).filter(v => v);
        for(const o of objectiveLines) {
            const objective = createObjectiveFromLine(o);
            this.objectives.push(objective);
        }
    }
    serialize() {
        return this.objectives.map(o => `${ o.serialize() }${ NEWLINE }`).join('');
    }
}