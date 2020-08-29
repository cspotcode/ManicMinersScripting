import gifFrames from 'gif-frames';
import PNG from 'png-js';
import streamToArray from 'stream-to-array';
import { outdent } from 'outdent';
import fs from 'fs';
import {Command, Cli} from 'clipanion';

class Args extends Command {
    @Command.String('--gif')
    gifPath!: string;

    @Command.String('--out')
    outputPath!: string;

    @Command.Path()
    async execute() {
        await main(this);
    }
}

async function main(args: Args) {
    const {outputPath, gifPath} = args;
    const frames = await parseFrames(gifPath);
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
        delay: 0.05,
        firstFrameDelay: 0.05,
        // startTime: 5,
        loop: true,
        renderMethod: 'highlights'
    });

    console.log(frames[0].width, frames[0].height);
    patchMap(outputPath, script);
}

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
    /** should be greater than time it takes to initialize */
    // startTime: number;
    loop: boolean;
    renderMethod: 'tiles' | 'highlights';
}
function framesToScript(options: ScriptOptions) {
    const {
        frames,
        delay, firstFrameDelay,
        // startTime,
        loop,
        width, height,
        mapXOffset, mapYOffset,
        xOffset, yOffset,
        xSampleRate, ySampleRate,
        renderMethod
    } = options;
    let script = '';
    function code(template: TemplateStringsArray, ...values: any[]) {
        script += outdent(template, ...values);
    }

    if(renderMethod === 'highlights') {
        code `
            # Declare all arrows, 4x for each pixel: 2x on, 2x off
        
        `;
        eachPixel((x, y) => {
            code `
                arrow ${arrowName(x, y, 'off', 'a') }=${ ArrowColor.Off }
                arrow ${arrowName(x, y, 'off', 'b') }=${ ArrowColor.Off }
                arrow ${arrowName(x, y, 'on', 'a') }=${ ArrowColor.On }
                arrow ${arrowName(x, y, 'on', 'b') }=${ ArrowColor.On }

            `;
        });
    }
    code `
        init::;

    `;

    if(renderMethod === 'highlights') {
        code `
            # Turn on all 'a' variant pixels
        `;
        eachPixel((x, y) => {
            code `
                highlight:${mapCoords(x, y) },${ arrowName(x, y, 'off', 'a') };
                highlight:${mapCoords(0, 0) },${ arrowName(x, y, 'on', 'a') };

            `;
        });
        code `
            # Wait till exactly when 'a' pixels blink off; then turn on 'b' variant pixels
            truewait:1;

        `;
        eachPixel((x, y) => {
            code `
                highlight:${mapCoords(x, y) },${ arrowName(x, y, 'off', 'b') };
                highlight:${mapCoords(0, 0) },${ arrowName(x, y, 'on', 'b') };

            `;
        });
    }

    code `
            animation;

            animation::;

        `;

    let previousFrame = undefined;
    for(let frameIndex = 0, framesCount = frames.length; frameIndex < framesCount; frameIndex++) {
        const frame = frames[frameIndex];
        code `
            # frame #${frameIndex}

        `;
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
                code `
                            place:${mapCoords(x, y) },${ on ? TileId.On : TileId.Off };

                        `;
            } else {
                code `
                    highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'a') };
                    highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'b') };
                    hidearrow:${ arrowName(x, y, on ? 'off' : 'on', 'a') };
                    hidearrow:${ arrowName(x, y, on ? 'off' : 'on', 'b') };

                `;
                // code `
                //     highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'a') };
                //     highlight:${mapCoords(x, y) },${ arrowName(x, y, on ? 'on' : 'off', 'b') };
                //     highlight:${rawMapCoords(0, 0) },${ arrowName(x, y, on ? 'off' : 'on', 'a') };
                //     highlight:${rawMapCoords(0, 0) },${ arrowName(x, y, on ? 'off' : 'on', 'b') };

                // `;
            }
        });
        code `
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
    function rawMapCoords(x: number, y: number) {
        return `${  y },${  x }`;
    }
}

function arrowName(x: number, y: number, onOff: 'on' | 'off', variant: 'a' | 'b') {
    return `render_${ x }_${ y }_${ onOff }_${ variant }`;
}

function* range(count) {
    for(let i = 0; i < count; i++) yield i;
}

const cli = new Cli({
    binaryLabel: 'Gif-to-ManicMiners',
    binaryName: 'gif-to-mm'
});
cli.register(Args);
cli.register(Command.Entries.Help);
cli.register(Command.Entries.Version);
cli.runExit(process.argv.slice(2), {
    ...Cli.defaultContext
});
