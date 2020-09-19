import * as random from "./python-shims/random";
import * as time from "./python-shims/time";
import { range, max, min } from './python-shims/globals';
import { createArrayFilledWith } from "./misc";
import { sortBy, keys, cloneDeep } from "lodash";
import { displayPNG } from "./displayPNG";
import { convertToMM } from "./convert-to-mm";
import { Parameters } from './parameters';
function _pj_snippets() {
  function in_es6(left, right) {
    if (right instanceof Array || typeof right === "string") {
      return right.indexOf(left) > -1;
    } else {
      if (
        right instanceof Map ||
        right instanceof Set ||
        right instanceof WeakMap ||
        right instanceof WeakSet
      ) {
        return right.has(left);
      } else {
        return left in right;
      }
    }
  }
  return {in_es6};
}
export const _pj = Object.assign({}, _pj_snippets());
/**
 * Python's `//` operator
 */
export function floordiv(a: number, b: number) {
  return (a / b) << 0;
}
export type Array2D<T = number> = Array<Array<T>>;
export function forEachArray2D(array: Array2D, callback: (i: number, j: number) => void) {
  for (let i = 0, _pj_a = array.length; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = array[0].length; j < _pj_b; j += 1) {
      callback(i, j);
    }
  }
}
export type Point = [number, number];
function pointsEqual(a: Point, b: Point) {
  return a[0] === b[0] && a[1] === b[1];
}
export type Biome = "ice" | "rock" | "lava";
export function attemptGenerationWithRetries(params: Parameters) {
  let attempts = 1;
  let success = false;
  let map: ReturnType<typeof mapgen> = null;
  while (!success && attempts < 100) {
    map = mapgen(params);
    if (map != null) {
      success = true;
    }
    attempts += 1;
  }
  return {success, map};
}
export type MapGenResult = ReturnType<typeof mapgen>;
/** returns `null` if unable to generate map */
export function mapgen(params: Parameters) {
  const start = time.process_time();
  if (params.size != null) {
    params.size = floordiv(params.size + 7, 8) * 8;
    params.length = params.size;
    params.width = params.size;
  }
  if (params.oxygen === -1) {
    params.oxygen = params.length * params.width * 3;
  }
  const solidArray = createArray(params.length, params.width, -1);
  const wallArray = createArray(params.length, params.width, -1);
  randomize(solidArray, 1 - params.solidDensity);
  speleogenesis(solidArray);
  cleanup(solidArray);
  if (fillExtra(solidArray) === false) {
    return null;
  }
  randomize(wallArray, 1 - params.wallDensity);
  speleogenesis(wallArray);
  cleanup(wallArray);
  details(wallArray, 3);
  for (let i = 0, _pj_a = params.length; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = params.width; j < _pj_b; j += 1) {
      if (solidArray[i][j] === -1) {
        wallArray[i][j] = 4;
      }
    }
  }
  const oreArray = createArray(params.length, params.width, -1);
  randomize(oreArray, 1 - params.oreDensity);
  speleogenesis(oreArray);
  cleanup(oreArray);
  details(oreArray, 4);
  const crystalArray = createArray(params.length, params.width, -1);
  randomize(crystalArray, 1 - params.crystalDensity);
  speleogenesis(crystalArray);
  cleanup(crystalArray);
  details(crystalArray, 5);
  const heightArray = heightMap(
    params.length + 1,
    params.width + 1,
    params.terrain,
    params.smoothness
  );
  if (!params.biome) {
    params.biome = (["ice", "rock", "lava"] as const)[random.randint(0, 2)];
  }
  if (!params.floodType) {
    if (params.biome === "ice") {
      params.floodType = "water";
    } else {
      if (params.biome === "lava") {
        params.floodType = "lava";
      } else {
        params.floodType = (["water", "lava"] as const)[random.randint(0, 1)];
      }
    }
  }
  flood(wallArray, heightArray, params.floodLevel, params.floodType);
  for (let i = 0, _pj_a = params.length; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = params.width; j < _pj_b; j += 1) {
      if (!_pj.in_es6(wallArray[i][j], range(1, 4))) {
        crystalArray[i][j] = 0;
        oreArray[i][j] = 0;
      }
    }
  }
  let flowList = [];
  if (params.biome === "lava") {
    params.flowDensity *= 3;
  }
  if (params.floodType === 7) {
    flowList = createFlowList(
      wallArray,
      params.flowDensity,
      heightArray,
      params.preFlow,
      params.terrain
    );
  }
  const landslideList = aLandslideHasOccured(wallArray, params.landslideDensity);
  aSlimySlugIsInvadingYourBase(wallArray, params.slugDensity);
  addSeams(wallArray, crystalArray, params.crystalSeamDensity, 10);
  addSeams(wallArray, oreArray, params.oreSeamDensity, 11);
  addRechargeSeams(wallArray, params.rechargeSeamDensity, 12);
  const base = chooseBase(wallArray);
  if (base === false) {
    return null;
  }
  setBase(base[0], wallArray, heightArray);
  const caveList = findCaves(wallArray, base[0]);
  const finish = time.process_time();

  function _convertToMM() {
  const MMtext = convertToMM(
    wallArray,
    caveList,
    params.biome,
    heightArray,
    crystalArray,
    oreArray,
    params.landslideInterval,
    landslideList,
    params.flowInterval,
    flowList,
    base as Point[],
    params.oxygen,
    params.name,
    params
  );
  return MMtext;
  }
  function renderToCanvas(canvasElement: HTMLCanvasElement) {
  displayPNG(wallArray, crystalArray, oreArray, landslideList, flowList, canvasElement);
  }
  function showHeight() {
    displayArr(heightArray);
  }
  function logStats() {
    console.log("Parameters:");
    for(const key of keys(params)) {

      console.log("    ", key, ": ", params[key]);
    }
    console.log("\nResults:");
    console.log("    Size: ", params.length, "x", params.width);
    console.log("    Tiles:", params.length * params.width);
    console.log("    Time: ", finish - start, "seconds");
    if (finish - start === 0) {
      console.log("Finished with infinite speed!");
    } else {
      console.log(
        "    Speed:",
        (params.length * params.width) / (finish - start),
        "tiles per second"
      );
    }
    console.log();
  }
  return {convertToMM: _convertToMM, renderToCanvas, showHeight, logStats};
}
function addSeams(array: Array2D, resourceArray: Array2D, density: number, type: number) {
  forEachArray2D(array, (i, j) => {
      if (resourceArray[i][j] > 2 && random.random() < density) {
        array[i][j] = type;
      }
  });
}
function addRechargeSeams(array: Array2D, density: number, type?: unknown) {
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (array[i][j] === 4) {
        if (
          ((array[i + 1][j] === 4 && array[i - 1][j] === 4) ||
            (array[i][j + 1] === 4 && array[i][j - 1] === 4)) &&
          (array[i + 1][j] < 4 ||
            array[i - 1][j] < 4 ||
            array[i][j + 1] < 4 ||
            array[i][j - 1] < 4)
        ) {
          if (random.random() < density) {
            array[i][j] = 12;
          }
        }
      }
    }
  }
}
function aLandslideHasOccured(array: Array2D, stability: number) {
  const landslideArray = createArray(array.length, array[0].length, -1);
  randomize(landslideArray, 1 - stability);
  speleogenesis(landslideArray);
  details(landslideArray, 3);
  const landslideList: Point[][] = [[], [], []];
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (landslideArray[i][j] > 0 && array[i][j] === 0) {
        array[i][j] = 8;
      }
      if (landslideArray[i][j] > 0 && _pj.in_es6(array[i][j], range(1, 4))) {
        landslideList[landslideArray[i][j] - 1].push([i, j]);
      }
    }
  }
  return landslideList;
}
function aSlimySlugIsInvadingYourBase(array: Array2D, slugDensity: number) {
  forEachArray2D(array, (i, j) => {
      if (array[i][j] === 0) {
        if (random.random() < slugDensity) {
          array[i][j] = 9;
        }
      }
  });
}
function chooseBase(array: Array2D) {
  const possibleBaseList: Point[] = [];
  for (let i = 1, _pj_a = array.length - 2; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 2; j < _pj_b; j += 1) {
      if (
        array[i][j] === 0 &&
        array[i + 1][j] === 0 &&
        array[i][j + 1] === 0 &&
        array[i + 1][j + 1] === 0
      ) {
        possibleBaseList.push([i, j]);
      }
    }
  }
  if (possibleBaseList.length === 0) {
    return false;
  }
  return [possibleBaseList[random.randint(0, possibleBaseList.length - 1)]];
}
function cleanup(array: Array2D) {
  let changed = true;
  while (changed === true) {
    changed = false;
    for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        if (
          (array[i - 1][j] === 0 && array[i + 1][j] === 0) ||
          (array[i][j - 1] === 0 && array[i][j + 1] === 0)
        ) {
          if (array[i][j] !== 0) {
            array[i][j] = 0;
            changed = true;
          }
        }
      }
    }
  }
}
/** mapping from generator IDs to MM IDs */
export const conversion = {
  [0]: "1",
  [1]: "26",
  [2]: "30",
  [3]: "34",
  [4]: "38",
  [6]: "11",
  [7]: "6",
  [8]: "63",
  [9]: "12",
  [10]: "42",
  [11]: "46",
  [12]: "50",
  [13]: "14",
};
export function createArray(x: number, y: number, fill: number): Array2D {
  const array = createArrayFilledWith(x, null);
  for (let i = 0, _pj_a = x; i < _pj_a; i += 1) {
    array[i] = createArrayFilledWith(y, null);
    for (let j = 0, _pj_b = y; j < _pj_b; j += 1) {
      array[i][j] = fill;
    }
  }
  return array;
}
function createFlowList(array: Array2D, density: number, height, preFlow, terrain: number) {
  const flowArray = createArray(array.length, array[0].length, -1);
  const spillList: Point[][] = [];
  const flowSourceList: Point[] = [];
  const sources: Point[] = [];
  forEachArray2D(array, (i, j) => {
      if (array[i][j] === 0) {
        flowSourceList.push([i, j]);
      }
      if (_pj.in_es6(array[i][j], range(4))) {
        flowArray[i][j] = 0;
      }
  });
  for (let i = flowSourceList.length, _pj_a = 0; i < _pj_a; i += -1) {
    if (random.random() < density) {
      sources.push(flowSourceList[i - 1]);
    }
  }
  for(const source of sources) {
    array[source[0]][source[1]] = 7;
    const flowList = [source];
    flowArray[source[0]][source[1]] = 1;
    let i = 0;
    while (i < flowList.length) {
      const adjacent = [
        [flowList[i][0] + 1, flowList[i][1]],
        [flowList[i][0] - 1, flowList[i][1]],
        [flowList[i][0], flowList[i][1] + 1],
        [flowList[i][0], flowList[i][1] - 1],
      ];
      const sourceElevation =
        height[flowList[i][0]][flowList[i][1]] +
        height[flowList[i][0] + 1][flowList[i][1]] +
        height[flowList[i][0]][flowList[i][1] + 1] +
        height[flowList[i][0] + 1][flowList[i][1] + 1];
      for (
        let space, _pj_f = 0, _pj_d = adjacent, _pj_e = _pj_d.length;
        _pj_f < _pj_e;
        _pj_f += 1
      ) {
        space = _pj_d[_pj_f];
        const elevation =
          height[space[0]][space[1]] +
          height[space[0] + 1][space[1]] +
          height[space[0]][space[1] + 1] +
          height[space[0] + 1][space[1] + 1];
        if (
          flowArray[space[0]][space[1]] === 0 &&
          sourceElevation > elevation - terrain * 3
        ) {
          flowList.push(space);
          flowArray[space[0]][space[1]] = 1;
        }
      }
      i += 1;
    }
    spillList.push(flowList);
    for (
      let space, _pj_f = 0, _pj_d = flowList, _pj_e = _pj_d.length;
      _pj_f < _pj_e;
      _pj_f += 1
    ) {
      space = _pj_d[_pj_f];
      flowArray[space[0]][space[1]] = 0;
    }
  }
  for (let i = 0, _pj_a = preFlow; i < _pj_a; i += 1) {
    const totalSources = sources.length;
    for (let j = 0, _pj_b = totalSources; j < _pj_b; j += 1) {
      const adjacent: Point[] = [
        [sources[j][0] + 1, sources[j][1]],
        [sources[j][0] - 1, sources[j][1]],
        [sources[j][0], sources[j][1] + 1],
        [sources[j][0], sources[j][1] - 1],
      ];
      for(const space of adjacent) {
        if (array[space[0]][space[1]] === 0 && random.random() < 0.5) {
          array[space[0]][space[1]] = 7;
          sources.push(space);
        }
      }
    }
  }
  return spillList;
}
function details(array: Array2D, maxDistance: number) {
  for (let n = 0, _pj_a = maxDistance; n < _pj_a; n += 1) {
    for (let i = 1, _pj_b = array.length - 1; i < _pj_b; i += 1) {
      for (let j = 1, _pj_c = array[0].length - 1; j < _pj_c; j += 1) {
        if (
          (array[i - 1][j] === n ||
            array[i + 1][j] === n ||
            array[i][j - 1] === n ||
            array[i][j + 1] === n) &&
          array[i][j] === -1
        ) {
          array[i][j] = n + 1;
        }
      }
    }
  }
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (array[i][j] === -1) {
        array[i][j] = maxDistance;
      }
    }
  }
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (array[i][j] >= 1) {
        array[i][j] = random.randint(array[i][j] - 1, array[i][j] + 1);
        if (array[i][j] <= 0) {
          array[i][j] = 1;
        }
        if (array[i][j] > maxDistance) {
          array[i][j] = maxDistance;
        }
      }
    }
  }
}
function display(array1: Array2D) {
  const colors = {
    1: "\u001b[48;2;24;0;59m",
    101: "\u001b[48;2;24;0;59m",
    26: "\u001b[48;2;166;72;233m",
    30: "\u001b[48;2;139;43;199m",
    34: "\u001b[48;2;108;10;163m",
    38: "\u001b[48;2;59;0;108m",
    [5]: "\u001b[48;2;61;38;20m",
    11: "\u001b[48;2;6;45;182m",
    111: "\u001b[48;2;6;45;182m",
    6: "\u001b[48;2;239;79;16m",
    106: "\u001b[48;2;239;79;16m",
    63: "\u001b[48;2;24;0;59m",
    163: "\u001b[48;2;24;0;59m",
    12: "\u001b[48;2;150;150;0m",
    112: "\u001b[48;2;150;150;0m",
    42: "\u001b[48;2;185;255;25m",
    46: "\u001b[48;2;146;62;20m",
    50: "\u001b[48;2;250;255;14m",
    14: "\u001b[48;2;190;190;190m",
    114: "\u001b[48;2;190;190;190m",
  } as const;
  for(const line of array1) {
    for(const i of line) {
      console.log(colors[i], "\u001b[38;2;0;255;16m", "  ");
    }
    console.log("\u001b[0m");
  }
}
function displayArr(array: Array2D, stats = false) {
  let min = array[0][0];
  let max = array[0][0];
  forEachArray2D(array, (i, j) => {
      if (array[i][j] < min) {
        min = array[i][j];
      }
      if (array[i][j] > max) {
        max = array[i][j];
      }
  });
  const difference = max - min;
  for(const line of array) {
    for(const i of line) {
      const value = (
        ((i - min) / (difference ? difference : 1)) * 255
      ) << 0;
      console.log("\u001b[48;2;", 0, ";", value, ";", 0, "m", "  ");
    }
    console.log("\u001b[0m");
  }
  if (stats) {
    const set: number[] = [];
    const differences: number[] = [];
    forEachArray2D(array, (i, j) => {
        if (!_pj.in_es6(array[i][j], set)) {
          set.push(array[i][j]);
        }
    });
    set.sort();
    console.log(set);
    for (let i = 0, _pj_a = set.length - 1; i < _pj_a; i += 1) {
      differences.push(set[i + 1] - set[i]);
    }
    console.log(differences);
  }
}
function fillExtra(array: Array2D) {
  const tmap = createArray(array.length, array[0].length, 0);
  forEachArray2D(array, (i, j) => {
      if (array[i][j] !== 0) {
        tmap[i][j] = -1;
      }
  });
  const spacesUnsorted = openSpaces(tmap, false);
  if (spacesUnsorted.length < 1) {
    return false;
  }
  const spaces = sortBy(spacesUnsorted, space => -space.length);
  spaces.shift();
  for (
    let space, _pj_c = 0, _pj_a = spaces, _pj_b = _pj_a.length;
    _pj_c < _pj_b;
    _pj_c += 1
  ) {
    space = _pj_a[_pj_c];
    for (
      let coord, _pj_f = 0, _pj_d = space, _pj_e = _pj_d.length;
      _pj_f < _pj_e;
      _pj_f += 1
    ) {
      coord = _pj_d[_pj_f];
      array[coord[0]][coord[1]] = -1;
    }
  }
  return true;
}
function fillSquare(i: number, j: number, array: Array2D, length: number, width: number, squareSize: number, value: number) {
  for (
    let k = max(i, 0), _pj_a = min(i + squareSize, length);
    k < _pj_a;
    k += 1
  ) {
    for (
      let l = max(j, 0), _pj_b = min(j + squareSize, width);
      l < _pj_b;
      l += 1
    ) {
      array[k][l] += value;
    }
  }
}
function findCaves(array: Array2D, base: Point) {
  const tmap = createArray(array.length, array[0].length, -1);
  const openSpaceIds = [0, 6, 7, 8, 9, 13];
  for (let i = 1, _pj_a = array.length; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length; j < _pj_b; j += 1) {
      if (openSpaceIds.includes(array[i][j])) {
        tmap[i][j] = 0;
      }
    }
  }
  const caveList = openSpaces(tmap, true);
  const caveListWithoutBase = caveList.filter(cave => !cave.some(point => pointsEqual(point, base)));
  return caveListWithoutBase;
}
function flood(array: Array2D, heightArray: Array2D, floodLevel: number, floodType: 'water' | 'lava' | 6 | 7) {
  let difference, floodHeight, length, maximum, minimum, width;
  length = array.length;
  width = array[0].length;
  if (floodType === "water") {
    floodType = 6;
  } else {
    floodType = 7;
  }
  minimum = heightArray[0][0];
  maximum = heightArray[0][0];
  for (let i = 0, _pj_a = length + 1; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = width + 1; j < _pj_b; j += 1) {
      maximum = max(heightArray[i][j], maximum);
      minimum = min(heightArray[i][j], minimum);
    }
  }
  difference = maximum - minimum;
  floodHeight = Number.parseInt(difference * floodLevel + minimum);
  for (let i = 0, _pj_a = length + 1; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = width + 1; j < _pj_b; j += 1) {
      heightArray[i][j] = max(heightArray[i][j], floodHeight);
    }
  }
  for (let i = 0, _pj_a = length; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = width; j < _pj_b; j += 1) {
      if (
        array[i][j] === 0 &&
        heightArray[i][j] === floodHeight &&
        heightArray[i + 1][j] === floodHeight &&
        heightArray[i][j + 1] === floodHeight &&
        heightArray[i + 1][j + 1] === floodHeight
      ) {
        array[i][j] = floodType;
      }
    }
  }
}
function heightMap(length: number, width: number, terrain: number, smoothness: number) {
  const array = createArray(length, width, 0);
  terrain = max(terrain, 1);
  for (let i = -smoothness, _pj_a = length; i < _pj_a; i += 1) {
    for (let j = -smoothness, _pj_b = width; j < _pj_b; j += 1) {
      const value = random.randint(
        -terrain,
        terrain
      );
      fillSquare(i, j, array, length, width, smoothness, value);
    }
  }
  return array;
}
function openSpaces(array: Array2D, corners: boolean) {
  const spaces: Point[][] = [];
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (array[i][j] === 0) {
        array[i][j] = 1;
        const space: Point[] = [];
        let index = 0;
        space.push([i, j]);
        while (index < space.length) {
          const [x, y] = space[index];
          if (array[x - 1][y] === 0) {
            array[x - 1][y] = 1;
            space.push([x - 1, y]);
          }
          if (array[x + 1][y] === 0) {
            array[x + 1][y] = 1;
            space.push([x + 1, y]);
          }
          if (array[x][y - 1] === 0) {
            array[x][y - 1] = 1;
            space.push([x, y - 1]);
          }
          if (array[x][y + 1] === 0) {
            array[x][y + 1] = 1;
            space.push([x, y + 1]);
          }
          if (corners) {
            if (array[x - 1][y - 1] === 0) {
              array[x - 1][y - 1] = 1;
              space.push([x - 1, y - 1]);
            }
            if (array[x + 1][y - 1] === 0) {
              array[x + 1][y - 1] = 1;
              space.push([x + 1, y - 1]);
            }
            if (array[x - 1][y + 1] === 0) {
              array[x - 1][y + 1] = 1;
              space.push([x - 1, y + 1]);
            }
            if (array[x + 1][y + 1] === 0) {
              array[x + 1][y + 1] = 1;
              space.push([x + 1, y + 1]);
            }
          }
          array[x][y] = 1;
          index += 1;
        }
        spaces.push(space);
      }
    }
  }
  return spaces;
}
function randomize(array: Array2D, probability: number) {
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (random.random() < probability) {
        array[i][j] = 0;
      }
    }
  }
}
function setBase(base: Point, array: Array2D, height: Array2D) {
  array[base[0]][base[1]] = 13;
  array[base[0] + 1][base[1]] = 13;
  const average = floordiv(
    height[base[0]][base[1]] +
      height[base[0] + 1][base[1]] +
      height[base[0]][base[1] + 1] +
      height[base[0] + 1][base[1] + 1],
    4
  );
  height[base[0]][base[1]] = average;
  height[base[0] + 1][base[1]] = average;
  height[base[0]][base[1] + 1] = average;
  height[base[0] + 1][base[1] + 1] = average;
}
function speleogenesis(array: Array2D) {
  let changed = true;
  while (changed) {
    changed = false;
    const tmap = createArray(array.length, array[0].length, 4);
    forEachArray2D(array, (i, j) => {
        tmap[i][j] = array[i][j];
    });
    for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
      for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
        let adjacent = 0;
        if (tmap[i + 1][j] === -1) {
          adjacent += 1;
        }
        if (tmap[i - 1][j] === -1) {
          adjacent += 1;
        }
        if (tmap[i][j + 1] === -1) {
          adjacent += 1;
        }
        if (tmap[i][j - 1] === -1) {
          adjacent += 1;
        }
        if (adjacent === 0) {
          if (array[i][j] !== 0) {
            changed = true;
            array[i][j] = 0;
          }
        } else {
          if (adjacent >= 3) {
            if (array[i][j] !== -1) {
              changed = true;
              array[i][j] = -1;
            }
          }
        }
      }
    }
  }
}
