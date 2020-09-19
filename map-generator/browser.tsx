import { observer } from "mobx-react"
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { attemptGenerationWithRetries, mapgen, MapGenResult } from "./map-generator";
import { generateDefaultParameters, inputs, Parameters, parse } from "./parameters";
import * as hashed from 'hashed';
import { autorun } from "mobx";
import { isBoolean, isNumber, isString } from "lodash";

let parameters: Parameters = new Parameters();
let map: MapGenResult = null;

function T<T>(t: T) { return t }
function TI<T>() { return function<I extends T>(i: I) {return i} }

window.addEventListener('load', onLoad);
function onLoad() {
    randomizeParams();

    {
        interface UrlHashState extends Partial<Parameters> {}
        function listener(newState: UrlHashState) {
            Object.assign(parameters, newState);
        }
        
        // register a state provider
        const update: (state: UrlHashState) => void = hashed.register(getSerializedParameters(), listener);

        function getSerializedParameters() {
            const serializeParameters = {} as Partial<Parameters>;
            for(const [key, value] of Object.entries(parameters)) {
                if(isNumber(value) || isString(value) || isBoolean(value)) {
                    serializeParameters[key] = value;
                }
            }
            return serializeParameters;
        }
        
        // When the state of your application changes, update the hash.
        autorun(() => {
            const serializedParameters = getSerializedParameters();
            console.log('Setting hash state', serializedParameters);
            // Update URL hash
            update(serializedParameters);
        });
    }

    renderRoot();
}

namespace UIRoot {
    export interface Params {
        parameters: Parameters;
    }
}

@observer
class UIRoot extends React.Component<UIRoot.Params> {
    render() {
        return <>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                alignContent: 'stretch'
            }}>
                <div>{
                    Array.from(inputs.entries()).map(([name, render]) => {
                        return <p style={{
                            whiteSpace: 'nowrap'
                        }}>
                            <label style={{
                                display: 'inline-block',
                                width: '200px'
                            }}>{name}</label>
                            {
                                render({
                                    onChange(e) {
                                        parameters[name] = parse(name, e.target.value);
                                        logParams();
                                    },
                                    value: parameters[name]
                                })
                            }
                        </p>;
                    })
                }
                </div>
                <div style={{
                    margin: '0 20px'
                }}>
                    <p>
                        <button id="randomize" onClick={ onRandomizeClicked }>Randomize Inputs</button>
                        <button id="generate" onClick={ onGenerateClicked }>Generate</button>
                        <button id="download" onClick={ onDownloadClicked }>Download</button>
                    </p>
                    <p>
                        <canvas width="1000" height="1000"></canvas>
                    </p>
                </div>
            </div>
        </>;
    }
}

function renderRoot() {
    ReactDOM.render(
        <UIRoot parameters={parameters} />,
        document.getElementById('render-here')
    );
}

function onRandomizeClicked() {
    randomizeParams();
}

function randomizeParams() {
    Object.assign(parameters, generateDefaultParameters());
    logParams();
}

function logParams() {
    console.log(parameters);
}

let mapDownloaded = false;

function onGenerateClicked() {
    mapDownloaded = false;
    const canvasElement = $('canvas')[0] as HTMLCanvasElement;
    const {success, map: _map} = attemptGenerationWithRetries(parameters);
    if(success) {
        map = _map;
        map!.renderToCanvas(canvasElement);
    }
}

let downloadCounter = 0;
function onDownloadClicked() {
    if(!mapDownloaded) downloadCounter++;
    mapDownloaded = true;
    const mapText = map.convertToMM();
    download(mapText, `${ parameters.name }_${ downloadCounter }.dat`);
}

function download(data: string, filename: string) {
  const blob = new Blob([data], {type : 'application/text'});
  const url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
