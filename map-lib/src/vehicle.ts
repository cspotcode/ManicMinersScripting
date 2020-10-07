import { Transform } from "./transform";
import { NEWLINE } from "./map";

export type VehicleNameUnion = keyof typeof VehicleName;

export enum VehicleName {
    // TODO add others
    RapidRider_C = 'RapidRider_C',
    SMLC_C = 'SMLC_C',
    CargoCarrier_C = 'CargoCarrier_C',
    TunnelTransport_C = 'TunnelTransport_C',
    TunnelScout_C = 'TunnelScout_C'
}

export type VehicleUpgradeName = keyof typeof VehicleUpgrade;
export enum VehicleUpgrade {
    UpAddDrill,
}

export class Vehicle {
    name: VehicleNameUnion;
    readonly transform: Transform = new Transform();
    readonly upgrades: VehicleUpgradeName[] = [];
    hpMax: boolean;
    hpValue: number;
    driverId: number | null;
    fromString(content: string) {
        const [name, transformString, misc] = content.split(NEWLINE);
        this.name = name as VehicleNameUnion;
        this.transform.parse(transformString);
        const [upgradesString, hpFullString, driverFullString] = misc.split(',');
        this.upgrades.length = 0;
        this.upgrades.push(...upgradesString.split('/').filter(v => v) as VehicleUpgradeName[]);
        const [, hpString] = hpFullString.split('=');
        const [, driverString] = driverFullString.split('=');
        this.hpMax = hpString === 'MAX';
        this.hpValue = hpString === 'MAX' ? 0 : parseInt(hpString);
        this.driverId = driverString === 'NO' ? null : parseInt(driverString);
    }
    toString(): string {
        return [
            `${name}`,
            `${this.transform.serialize()}`,
            `upgrades=${this.upgrades.join('/') + '/'},HP=${ this.hpMax ? 'MAX' : this.hpValue },driver=${ this.driverId == null ? 'NO' : this.driverId }`,
            ''
        ].join(NEWLINE);
    }
}