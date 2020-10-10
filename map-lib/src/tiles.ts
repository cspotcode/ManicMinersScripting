// export class Array2D<T = number> {
//     constructor(...args: (T extends number ? [defaultFill?: T] : [defaultFill: T])) {
//         const [defaultFill = 0 as any as T] = args;
//         this._defaultFill = defaultFill;
//     }
//     private _defaultFill: T;
//     get(x: number, y: number): T {
//         return this.rows[y][x];
//     }
//     set(x: number, y: number, value: T): void {
//         this.rows[y][x] = value;
//     }
//     set height(v: number) {
//         const {width, _rows, _defaultFill} = this;
//         if(_rows.length > v) _rows.length = v;
//         else {
//             while(_rows.length < v) {
//                 _rows.push(createArray(width, _defaultFill));
//             }
//         }
//     }
//     get height() {
//         return this.rows.length;
//     }
//     get width() {
//         return this.rows[0]?.length ?? 0;
//     }
//     set width(v: number) {
//         const {width, height, _rows, _defaultFill} = this;
//         for(const row of _rows) {
//             if(row.length > v) row.length = v;
//             else {
//                 while(row.length < v) {
//                     row.push(_defaultFill);
//                 }
//             }
//         }
//     }
//     forEach(cb: (x: number, y: number, value: T) => void) {
//         const {width, height} = this;
//         for(let y = 0; y < height; y++) {
//             for(let x = 0; x < width; x++) {
//                 cb(x, y, this.get(x, y));
//             }
//         }
//     }
//     private get _rows() {
//         return this.rows as Array<Array<T>>;
//     }
//     readonly rows: ReadonlyArray<Array<T>>;
// }

function createArray<T>(length: number): Array<number>;
function createArray<T>(length: number, fill: T): Array<T>;
function createArray(length: number, fill: any = 0): Array<any> {
    const ret = [];
    for(let i = 0; i < length; i++) {
        ret.push(fill);
    }
    return ret;
}

export enum Tile {
    Ground = 1,
    RubbleLevel1,
    RubbleLevel2,
    RubbleLevel3,
    RubbleLevel4,
    Lava,
    ErosionLevel4,
    ErosionLevel3,
    ErosionLevel2,
    ErosionLevel1 = 10,
    Water,
    SlimySlugHole,
    PowerPathInProgress,
    PowerPathBuilding,
    PowerPathBuildingPowered,
    PowerPath1,
    PowerPath1Powered,
    PowerPath2Adjacent,
    PowerPath2AdjacentPowered,
    PowerPath2Opposite = 20,
    PowerPath2OppositePowered,
    PowerPath3,
    PowerPath3Powered,
    PowerPath4,
    PowerPath4Powered,
    DirtRegular,
    DirtCorner,
    DirtEdge,
    DirtIntersect,
    LooseRockRegular = 30,
    LooseRockCorner,
    LooseRockEdge,
    LooseRockIntersect,
    HardRockRegular,
    HardRockCorner,
    HardRockEdge,
    HardRockIntersect,
    SolidRockRegular,
    SolidRockCorner,
    SolidRockEdge = 40,
    SolidRockIntersect,
    CrystalSeamRegular,
    CrystalSeamCorner,
    CrystalSeamEdge,
    CrystalSeamIntersect,
    OreSeamRegular,
    OreSeamCorner,
    OreSeamEdge,
    OreSeamIntersect,
    RechargeSeamRegular = 50,
    RechargeSeamCorner,
    RechargeSeamEdge,
    RechargeSeamIntersect,
    UNUSED1,
    UNUSED2,
    UNUSED3,
    UNUSED4,
    Roof,
    UNUSED5,
    FakeRubble1 = 60,
    FakeRubble2 = 61,
    FakeRubble3 = 62,
    FakeRubble4 = 63,
    CliffType1Experimental = 64,
    CliffType2Experimental = 65,

    // Reinforced walls have +50 added to the numeric value
    // Ground_Reinforced = 51,
    // RubbleLevel1_Reinforced = 52,
    // RubbleLevel2_Reinforced = 53,
    // RubbleLevel3_Reinforced = 54,
    // RubbleLevel4_Reinforced = 55,
    // Lava_Reinforced = 56,
    // ErosionLevel4_Reinforced = 57,
    // ErosionLevel3_Reinforced = 58,
    // ErosionLevel2_Reinforced = 59,
    // ErosionLevel1_Reinforced = 60,
    // Water_Reinforced = 61,
    // SlimySlugHole_Reinforced = 62,
    // PowerPathInProgress_Reinforced = 63,
    // PowerPathBuilding_Reinforced = 64,
    // PowerPathBuildingPowered_Reinforced = 65,
    // PowerPath1_Reinforced = 66,
    // PowerPath1Powered_Reinforced = 67,
    // PowerPath2Adjacent_Reinforced = 68,
    // PowerPath2AdjacentPowered_Reinforced = 69,
    // PowerPath2Opposite_Reinforced = 70,
    // PowerPath2OppositePowered_Reinforced = 71,
    // PowerPath3_Reinforced = 72,
    // PowerPath3Powered_Reinforced = 73,
    // PowerPath4_Reinforced = 74,
    // PowerPath4Powered_Reinforced = 75,
    First_Reinforced_Id = 76,
    DirtRegular_Reinforced = 76,
    DirtCorner_Reinforced = 77,
    DirtEdge_Reinforced = 78,
    DirtIntersect_Reinforced = 79,
    LooseRockRegular_Reinforced = 80,
    LooseRockCorner_Reinforced = 81,
    LooseRockEdge_Reinforced = 82,
    LooseRockIntersect_Reinforced = 83,
    HardRockRegular_Reinforced = 84,
    HardRockCorner_Reinforced = 85,
    HardRockEdge_Reinforced = 86,
    HardRockIntersect_Reinforced = 87,
    SolidRockRegular_Reinforced = 88,
    SolidRockCorner_Reinforced = 89,
    SolidRockEdge_Reinforced = 90,
    SolidRockIntersect_Reinforced = 91,
    CrystalSeamRegular_Reinforced = 92,
    CrystalSeamCorner_Reinforced = 93,
    CrystalSeamEdge_Reinforced = 94,
    CrystalSeamIntersect_Reinforced = 95,
    OreSeamRegular_Reinforced = 96,
    OreSeamCorner_Reinforced = 97,
    OreSeamEdge_Reinforced = 98,
    OreSeamIntersect_Reinforced = 99,
    RechargeSeamRegular_Reinforced = 100,
    RechargeSeamCorner_Reinforced = 101,
    RechargeSeamEdge_Reinforced = 102,
    RechargeSeamIntersect_Reinforced = 103,
    CliffType1Experimental_Reinforced = 114,
    CliffType2Experimental_Reinforced = 115,
    Last_Reinforced_Id = 115,
}

namespace TileUtils {
    export function isPlaceable() {}
    export function isReinforced(tileId: Tile) {
        return tileId > 150 || (tileId > 50 && false /* TODO */);
    }
    export function isHidden(tileId: Tile) {
        return tileId > 100;
    }
}

if(Tile.CliffType2Experimental !== 65) throw new Error('Tile enum is somehow wrong');
for(const [key, value] of Object.entries(Tile)) {
    if(key.endsWith('_Reinforced')) {
        const reinforcedId = Tile[key as keyof typeof Tile];
        const unReinforcedId = Tile[key.replace(/_Reinforced$/, '') as keyof typeof Tile];
        if(reinforcedId !== unReinforcedId + 50) throw new Error('Tile enum is somehow wrong: reinforced ID should be unreinforced ID + 50');
    }
}
