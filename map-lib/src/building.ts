import { chunk } from "lodash";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";
import { Transform } from "./transform";

export type BuildingNameUnion = keyof typeof BuildingName;
export enum BuildingName {
    BuildingToolStore_C,
    BuildingTeleportPad_C,
    BuildingDocks_C,
    BuildingCanteen_C,
    BuildingPowerStation_C,
    BuildingSupportStation_C,
    BuildingOreRefinery_C,
    BuildingGeologicalCenter_C,
    BuildingUpgradeStation_C,
    BuildingMiningLaser_C,
    BuildingSuperTeleport_C,
}

/*
BuildingMiningLaser_C
Translation: X=1650.000 Y=1650.000 Z=0.000 Rotation: P=0.000000 Y=-89.999992 R=0.000000 Scale X=1.000 Y=1.000 Z=1.000
Level=1
Teleport=False
Health=MAX
Powerpaths=X=0 Y=5 Z=5/
*/

export class Building {
    type!: BuildingNameUnion;
    transform = new Transform();
    level = 1;
    teleport = false;
    hpMax = true;
    hpValue: number | null = null;
    readonly powerPaths: PowerPath[] = [];

    serialize() {
        return [
            `${this.type}`,
            `${this.transform.serialize()}`,
            `Level=${this.level}`,
            `Teleport=${this.teleport ? 'True' : 'False'}`,
            `Health=${ this.hpMax ? 'MAX' : this.hpValue }`,
            `Powerpaths=${ this.powerPaths.map(pp => `X=${pp.x} Y=${pp.y} Z=${pp.z}`).join('/') + '/' }`,
            ``
        ].join(NEWLINE);
    }
    parse(c: string) {
        const [name, transformLine, levelLine, teleportLine, healthLine, powerPathsLine] = c.split(NEWLINE);
        this.type = name as BuildingNameUnion;
        this.transform.parse(transformLine);
        this.level = parseInt(levelLine.match(/Level=(\d+)/)![1]);
        this.teleport = teleportLine.match(/Teleport=(.*)/)![1] === 'True' ? true : false;
        const healthString = healthLine.match(/Health=(.*)/)![1];
        this.hpMax = healthString === 'MAX';
        this.hpValue = this.hpMax ? null : parseFloat(healthString);
        const powerPaths = powerPathsLine.match(/Powerpaths=(.*)/)![1].split('/').filter(v => v);
        this.powerPaths.length = 0;
        for(const pp of powerPaths) {
            const [, xs, ys, zs] = pp.match(/^X=(\d+) Y=(\d+) Z=(\d+)$/)!;
            this.powerPaths.push({
                x: parseInt(xs),
                y: parseInt(ys),
                z: parseInt(zs)
            });
        }
    }
}

interface PowerPath {
    x: number;
    y: number;
    z: number;
}

export class BuildingsSection extends AbstractMapSection {
    readonly name = MapSectionName.buildings;
    readonly buildings: Building[] = [];
    parse(c: string) {
        const lineGroups = chunk(c.split(NEWLINE).filter(v => v), 6);
        this.buildings.length = 0;
        for(const group of lineGroups) {
            const building = new Building();
            building.parse(group.join(NEWLINE) + NEWLINE);
            this.buildings.push(building);
        }
    }
    serialize() {
        return this.buildings.map(b => {
            return b.serialize();
        }).join('');
    }
}