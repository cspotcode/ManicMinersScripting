import gifFrames from 'gif-frames';
import util from 'util';
import { promisify } from 'util';
import PNG from 'png-js';
import streamToArray from 'stream-to-array';
import { outdent } from 'outdent';
import fs from 'fs';

const enum TileId {
    Ground = 1,
    RubbleL1 = 2,
    Lava = 6,
    Water = 11,
    SlimySlugHole = 12,
    PowerPathInProgress = 13,
    PowerPathBuilding = 14,
    PowerPathBuildingPowered = 15,
    PowerPath1 = 16,
    PowerPath1Powered = 17,
    Off = PowerPathBuilding,
    On = PowerPathBuildingPowered
}

const enum ArrowColor {
    red = 'red',
    green = 'green',
    blue = 'blue',
    darkgreen = 'darkgreen',
    yellow = 'yellow',
    white = 'white',
    black = 'black',
    On = white,
    Off = black
}

async function main() {
    const frames = await parseFrames('image.gif');
    const script = framesToScript({
        frames,
        // xOffset: Math.floor(frames[0].width / 2) - 50,
        // yOffset: Math.floor(frames[0].height / 2) - 50,
        xOffset: 80,
        yOffset: 50,
        xSampleRate: 6,
        ySampleRate: 6,
        width: 30,
        height: 30,
        mapXOffset: 1,
        mapYOffset: 1,
        delay: 0.1,
        firstFrameDelay: 0.1,
        startTime: 1,
        loop: true,
        renderMethod: 'highlights'
    });

    console.log(frames[0].width, frames[0].height);
    patchMap('./gif-to-mm.dat', script);
}

function patchMap(mapPath: string, script: string) {
    const map = fs.readFileSync(mapPath, 'utf8');
    let patchedMap = map.replace(/(script *\{)[\s\S\r\n]+/, ($0, $1) => outdent`
        ${ $1 }
        ${ script }
        }

    `);
    patchedMap = patchedMap.replace(/\r?\n/g, '\r\n');
    fs.writeFileSync(mapPath, patchedMap);
}

type Frame = ReturnType<typeof parseFrames> extends PromiseLike<ArrayLike<infer T>> ? T : never;
async function parseFrames(path: string = 'image.gif') {
    const frames_: Array<any> = await (gifFrames({
        url: path,
        frames: 'all',
        cumulative: true,
        outputType: 'png'
    }) as Promise<any>);

    const frames = await Promise.all(frames_.map(async frame => {
        const dataStream = frame.getImage();
        const array: Array<Buffer> = await streamToArray(dataStream);
        const dataBuffer = Buffer.concat(array);
        const png = new PNG(dataBuffer);
        const buffer: Buffer = await new Promise(res => png.decodePixels(res));
        const { width, height } = png;
        return {
            getPixel(x: number, y: number) {
                if(x > width) return [0, 0, 0];
                if(y > height) return [0, 0, 0];
                const offset = (y * png.width + x) * 4;
                return [buffer[offset], buffer[offset + 1], buffer[offset + 2]] as const;
            },
            getRed(x: number, y: number) {
                if(x > width) return 0;
                if(y > height) return 0;
                const offset = (y * png.width + x) * 4;
                return buffer[offset];
            },
            width: png.width,
            height: png.height,
            png,
            buffer
        };
    }));

    return frames;
}

interface ScriptOptions {
    frames: Frame[];
    xOffset: number;
    yOffset: number;
    xSampleRate: number;
    ySampleRate: number;
    width: number;
    height: number;
    mapXOffset: number;
    mapYOffset: number;
    delay: number;
    firstFrameDelay: number;
    startTime: number;
    loop: boolean;
    renderMethod: 'tiles' | 'highlights';
}
function framesToScript(options: ScriptOptions) {
    const {
        frames,
        delay, firstFrameDelay, startTime, loop,
        width, height,
        mapXOffset, mapYOffset,
        xOffset, yOffset,
        xSampleRate, ySampleRate,
        renderMethod
    } = options;
    let script = '';

    if(renderMethod === 'highlights') {
        eachPixel((x, y) => {
            script += outdent`
                arrow ${arrowName(x, y, 'off', 'a') }=${ ArrowColor.Off }
                arrow ${arrowName(x, y, 'off', 'b') }=${ ArrowColor.Off }
                arrow ${arrowName(x, y, 'on', 'a') }=${ ArrowColor.On }
                arrow ${arrowName(x, y, 'on', 'b') }=${ ArrowColor.On }

            `;
        });
        script += 'init::;'
        eachPixel((x, y) => {
            script += outdent`
                    highlight:${mapCoords(x, y) },${ arrowName(x, y, 'off', 'a') };
                    highlight:${mapCoords(x, y) },${ arrowName(x, y, 'on', 'a') };

            `;
        });
        script += outdent`
            truewait:0.5;

        `;
        eachPixel((x, y) => {
            script += `
                    highlight:${mapCoords(0, 0) },${ arrowName(x, y, 'off', 'b') };
                    highlight:${mapCoords(0, 0) },${ arrowName(x, y, 'on', 'b') };

            `;
        });
    }

    script += outdent`
            when(time:${startTime })[animation]
            animation::;

        `;

    let previousFrame = undefined;
    for(const frame of frames) {
        eachPixel((x, y) => {
            const xPixel = xOffset + x * xSampleRate;
            const yPixel = yOffset + y * ySampleRate;
            // const [r, g, b] = frame.getPixel(xOffset + x * xSampleRate, yOffset + y * ySampleRate);
            const r = frame.getRed(xPixel, yPixel);
            const on = r > 50;
            if(previousFrame) {
                // const [pr, pg, pb] = previousFrame.getPixel(xOffset + x, yOffset + y);
                const pr = previousFrame.getRed(xPixel, yPixel);
                const pon = pr > 50;
                if(pon === on) return;
            }
            if(renderMethod === 'tiles') {
                script += outdent`
                            place:${mapCoords(x, y) },${ on ? TileId.On : TileId.Off };

                        `;
            } else {
                script += outdent`
                        highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'a') };
                        highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'b') };
                        highlight:${mapCoords(0, 0) },${ arrowName(x, y, on ? 'off' : 'on', 'a') };
                        highlight:${mapCoords(0, 0) },${ arrowName(x, y, on ? 'off' : 'on', 'b') };

                    `;
            }
        });
        script += outdent`
            wait:${previousFrame ? delay : firstFrameDelay };

        `;
        previousFrame = frame;
    }
    if(loop) {
        script += 'animation;\n';
    }
    return script;

    function eachPixel(cb: (x: number, y: number) => void) {
        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                cb(x, y);
            }
        }
    }
    function mapCoords(x: number, y: number) {
        return `${ mapYOffset + y },${ mapXOffset + x }`;
    }
}

function arrowName(x: number, y: number, onOff: 'on' | 'off', variant: 'a' | 'b') {
    return `render_${ x }_${ y }_${ onOff }_${ variant }`;
}

function* range(count) {
    for(let i = 0; i < count; i++) yield i;
}

main();