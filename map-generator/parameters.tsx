import { Biome } from "./map-generator";
import * as React from 'react';
import * as random from "./python-shims/random";
import { observable } from "mobx";

export const inputs = new Map<string, InputRenderFn>();
export const inputParsedAs = new Map<string, 'number'>();
function Input(render: InputRenderFn) {
    const Input: PropertyDecorator = (target: any, propertyKey: string) => {
        inputs.set(propertyKey, render);
    }
    return Input;
}
const ParseAsNumber: PropertyDecorator = (target: any, propertyKey: string) => {
    inputParsedAs.set(propertyKey, 'number');
};

export function parse(name: string, value: string) {
    if(inputParsedAs.get(name) === 'number') return +value;
    return value;
}

type Bindings = {
    onChange: React.EventHandler<React.ChangeEvent<HTMLInputElement | HTMLSelectElement>>;
    value: string;
}
type InputRenderFn = (changeBindings: Bindings) => JSX.Element;

const densityInputRender: InputRenderFn = (bindings) => <input type="range" min="0" max="1" step="0.01" {...bindings} ></input>;
const sizeInputRender: InputRenderFn = (bindings) => <input type="number" min="8" max="256" step="8" {...bindings} ></input>;

export class Parameters {
    // @observable
    // @ParseAsNumber
    // @Input(sizeInputRender)
    length: number;

    // @observable
    // @ParseAsNumber
    // @Input(sizeInputRender)
    width: number;

    @observable
    @ParseAsNumber
    @Input(sizeInputRender)
    size?: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    solidDensity: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    wallDensity: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    oreDensity: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    crystalDensity: number;
    
    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    oreSeamDensity: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    crystalSeamDensity: number;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    rechargeSeamDensity: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    floodLevel: number;

    @observable
    @Input(bindings =>
        <select name="floodType" {...bindings}>
            <option value="water">Water</option>
            <option value="lava">Lava</option>
        </select>
    )
    floodType?: 'water' | 'lava' | 6 | 7;

    @observable
    @ParseAsNumber
    @Input(densityInputRender)
    flowDensity: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    flowInterval: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    preFlow: number;

    @observable
    @ParseAsNumber
    landslideDensity: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    landslideInterval: number;

    @observable
    @ParseAsNumber
    slugDensity: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    terrain: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    smoothness: number;

    @observable
    @ParseAsNumber
    @Input(bindings => <input type="number" {...bindings}></input>)
    oxygen: number;

    @observable
    @Input(bindings =>
        <select name="biome" {...bindings}>
            <option value="lava">Lava</option>
            <option value="ice">Ice</option>
            <option value="rock">Rock</option>
        </select>
    )
    biome?: Biome;
    // @Input(bindings => <input type="checkbox" {...bindings}></input>)
    stats: boolean;
    // @Input(bindings => <input type="checkbox" {...bindings}></input>)
    save: boolean;

    @observable
    @Input(bindings => <input type="text" {...bindings}></input>)
    name: string;
    show: boolean | 'height' | 'both';
}
export function generateDefaultParameters(): Parameters {
  return {
    length: undefined,
    width: undefined,
    size: 64,
    solidDensity: random.random() * 0.3 + 0.2,
    wallDensity: random.random() * 0.3 + 0.3,
    oreDensity: random.random() * 0.3 + 0.3,
    crystalDensity: random.random() * 0.3 + 0.2,
    oreSeamDensity: random.random() * 0.25,
    crystalSeamDensity: random.random() * 0.5,
    rechargeSeamDensity: random.random() * 0.08 + 0.01,
    floodLevel: random.random() * 0.75,
    floodType: undefined,
    flowDensity: random.random() * 0.005,
    flowInterval: random.randint(20, 180),
    preFlow: random.randint(3, 8),
    landslideDensity: random.random() * 0.4,
    landslideInterval: random.randint(10, 90),
    slugDensity: random.random() * 0.01,
    terrain: random.randint(0, 25),
    smoothness: 16,
    oxygen: -1,
    biome: 'rock',
    stats: true,
    save: true,
    name: 'Untitled',
    show: false,
  };
}

export type ParametersSpecified = {[K in keyof Parameters]: boolean};
