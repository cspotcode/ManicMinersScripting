import { Transform } from "./transform";
import { NEWLINE } from "./map";
import { AbstractMapSection, MapSectionName } from "./map-section";
import { chunk } from "lodash";

export type VehicleNameUnion = keyof typeof VehicleName;

export enum VehicleName {
    VehicleLoaderDozer_C = 'VehicleLoaderDozer_C',
    VehicleLMLC_C = 'VehicleLMLC_C',
    VehicleChromeCrusher_C = 'VehicleChromeCrusher_C',
    VehicleRapidRider_C = 'VehicleRapidRider_C',
    VehicleCargoCarrier_C = 'VehicleCargoCarrier_C',
    VehicleSMLC_C = 'VehicleSMLC_C',
    VehicleSmallTransportTruck_C = 'VehicleSmallTransportTruck_C',
    VehicleSmallDigger_C = 'VehicleSmallDigger_C',
    VehicleTunnelScout_C = 'VehicleTunnelScout_C',
    VehicleHoverScout_C = 'VehicleHoverScout_C',
    VehicleTunnelTransport_C = 'VehicleTunnelTransport_C',
    VehicleGraniteGrinder_C = 'VehicleGraniteGrinder_C',
}

export type VehicleUpgradeName = keyof typeof VehicleUpgrade;
export enum VehicleUpgrade {
    UpCargoHold = 'UpCargoHold',
    UpEngine = 'UpEngine',
    UpLaser = 'UpLaser',
    UpScanner = 'UpScanner',
    UpDrill = 'UpDrill',
    UpAddDrill = 'UpAddDrill',
    UpAddNav = 'UpAddNav',
}
const VehicleUpgradeNames = Object.keys(VehicleUpgrade) as VehicleUpgradeName[];

type _t = {[K in keyof typeof VehicleUpgrade]: boolean};
export class VehicleUpgradeBooleans implements _t {
    UpEngine = false;
    UpLaser = false;
    UpScanner = false;
    UpDrill = false;
    UpAddDrill = false;
    UpCargoHold = false;
    UpAddNav = false;
    clear() {
        for(const key of VehicleUpgradeNames) {
            this[key] = false;
        }
    }
}

export class Vehicle {
    name!: VehicleNameUnion;
    readonly transform: Transform = new Transform();
    readonly upgrades = new VehicleUpgradeBooleans();
    hpMax: boolean = true;
    hpValue: number = 0;
    driverId: number | null = null;
    id: number | null = null;
    parse(content: string) {
        const [name, transformString, misc] = content.split(NEWLINE);
        this.name = name as VehicleNameUnion;
        this.transform.parse(transformString);
        const [upgradesFullString, hpFullString, driverFullString,idFullString] = misc.split(',');
        const upgradesString = upgradesFullString.match(/upgrades=(.*)/)![1];
        this.upgrades.clear();
        if(upgradesString !== 'NO') {
            for(const upgrade of upgradesString.split('/').filter(v => v) as VehicleUpgradeName[]) {
                this.upgrades[upgrade] = true;
            }
        }
        const [, hpString] = hpFullString.split('=');
        const [, driverString] = driverFullString.split('=');
        const idString = idFullString?.split('=')?.[1];
        this.hpMax = hpString === 'MAX';
        this.hpValue = hpString === 'MAX' ? 0 : parseInt(hpString);
        this.driverId = driverString === 'NO' ? null : parseInt(driverString);
        this.id = idString ? parseInt(idString) : null;
    }
    serialize(): string {
        const upgradeString = VehicleUpgradeNames.filter(upgradeName => this.upgrades[upgradeName]).join('/') + '/';
        return [
            `${ this.name }`,
            `${ this.transform.serialize() }`,
            `upgrades=${ upgradeString === '/' ? 'NO' : upgradeString },HP=${ this.hpMax ? 'MAX' : this.hpValue },driver=${ this.driverId == null ? 'NO' : this.driverId }${ this.id == null ? '' : `,ID=${ this.id }`}`,
            ''
        ].join(NEWLINE);
    }
}

export class VehiclesSection extends AbstractMapSection {
    readonly name = MapSectionName.vehicles;
    readonly vehicles: Vehicle[] = [];
    parse(content: string) {
        this.vehicles.length = 0;
        const vehiclesLines = chunk(content.split(NEWLINE).filter(v => v), 3);
        for(const vehicleLines of vehiclesLines) {
            const vehicle = new Vehicle();
            vehicle.parse(vehicleLines.join(NEWLINE) + NEWLINE);
            this.vehicles.push(vehicle);
        }
    }
    serialize(): string {
        return this.vehicles.map(v => v.serialize()).join('');
    }
}

/*
RapidRider_C
Translation: X=820.883 Y=13300.196 Z=5.852 Rotation: P=0.000082 Y=89.511635 R=-0.012451 Scale X=0.910 Y=0.910 Z=0.910
upgrades=UpAddDrill/,HP=MAX,driver=4
*/