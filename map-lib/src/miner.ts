import { chunk } from "lodash";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";
import { Transform } from "./transform";

export type MinerUpgradeName = keyof typeof MinerUpgrade;

export enum MinerUpgrade {
    Drill,
    Shovel,
    Hammer,
    Sandwich,
    Spanner,
    JobDriver,
    JobSailor,
    JobPilot,
    JobGeologist,
    JobEngineer,
    JobExplosivesExpert,
}

export class Miner {
    readonly transform: Transform = new Transform();
    readonly upgrades: MinerUpgradeName[] = [];
    level: number = 0;
    id: number = 0;
    name: string | null = null;
    parse(content: string) {
        const [idNameLine, transformString, upgradesInput] = content.split(NEWLINE);
        const [idString, nameString] = idNameLine.match(/ID=(.*)$/)![1].split('/');
        this.id = parseInt(idString);
        this.name = nameString ?? null;
        this.transform.parse(transformString);
        const upgradeStrings = upgradesInput.split('/').filter(v => v);
        const upgrades = upgradeStrings.filter(v => v !== 'Level') as MinerUpgradeName[];
        this.upgrades.length = 0;
        this.upgrades.push(...upgrades);
        this.level = upgradeStrings.length - upgrades.length;
    }
    serialize(): string {
        let levels = '/';
        for(let i = this.level; i > 0; i--) {
            levels += 'Level/';
        }
        return [
            `ID=${ this.id }${ this.name == null ? '' : `/${ this.name }` }`,
            `${this.transform.serialize()}`,
            `${this.upgrades.join('/')}${levels}`,
            ''
        ].join(NEWLINE);
    }
}

export class MinersSection extends AbstractMapSection {
    readonly name = MapSectionName.miners;
    readonly miners: Miner[] = [];
    parse(content: string) {
        const minerInputs = chunk(content.split(NEWLINE).filter(v => v), 3);
        this.miners.length = 0;
        for(const minerInput of minerInputs) {
            const miner = new Miner();
            miner.parse(minerInput.join(NEWLINE) + NEWLINE);
            this.miners.push(miner);
        }
    }
    serialize(): string {
        return this.miners.map(m => m.serialize()).join('');
    }
}