import { cloneDeep } from "lodash";
import { Array2D, Biome, Point, conversion, forEachArray2D, floordiv, _pj, createArray } from "./map-generator";
import { Parameters } from "./parameters";
import { min } from "./python-shims/globals";

export function convertToMM(
  walls: Array2D,
  caveList: Point[][],
  biome: Biome,
  height: Array2D,
  crystals: Array2D,
  ore: Array2D,
  landslideInterval: number,
  landslideList: Point[][],
  flowInterval: number,
  flowList: Point[][],
  base: Point[],
  oxygen: number,
  name: string,
  params: Parameters
) {
  let crystalCount = countAccessibleCrystals(walls, base[0], crystals, false);
  if (crystalCount >= 14) {
    crystalCount = countAccessibleCrystals(walls, base[0], crystals, true);
  }
  let MMtext =
    "info{\n" +
    "rowcount:" +
    walls.length.toString() +
    "\n" +
    "colcount:" +
    walls[0].length.toString() +
    "\n" +
    "camerapos:Translation: X=" +
    (base[0][1] * 300 + 300).toString() +
    " Y=" +
    (base[0][0] * 300 + 300).toString() +
    " Z=" +
    height[base[0][0]][base[0][1]].toString() +
    " Rotation: P=44.999992 Y=180.000000 R=0.000000 Scale X=1.000 Y=1.000 Z=1.000\n" +
    "biome:" +
    biome +
    "\n" +
    "creator:Map Generator for Manic Miners\n" +
    (oxygen
      ? "oxygen:" + oxygen.toString() + "/" + oxygen.toString() + "\n"
      : "") +
    "levelname:" +
    name +
    "\n" +
    "erosioninitialwaittime:10\n" +
    "}\n";
  MMtext += "tiles{\n";
  const outputWalls = cloneDeep(walls).map(v => v.map(v => ''));
  forEachArray2D(walls, (i, j) => {
      outputWalls[i][j] = conversion[walls[i][j]];
  });
  for(const cave of caveList) {
    for(const space of cave) {
      outputWalls[space[0]][space[1]] = (
        Number.parseInt(outputWalls[space[0]][space[1]]) + 100
      ).toString();
    }
  }
  for(const w of outputWalls) {
    for(const i of w) {
      MMtext += i + ",";
    }
    MMtext += "\n";
  }
  MMtext += "}\n";
  MMtext += "height{\n";
  for(const w of height) {
    for(const i of w) {
      MMtext += i.toString() + ",";
    }
    MMtext += "\n";
  }
  MMtext += "}\n";
  MMtext += "resources{\n";
  MMtext += "crystals:\n";
  for(const w of crystals) {
    for(const i of w) {
      MMtext += i.toString() + ",";
    }
    MMtext += "\n";
  }
  MMtext += "ore:\n";
  for(const w of ore) {
    for(const i of w) {
      MMtext += i.toString() + ",";
    }
    MMtext += "\n";
  }
  MMtext += "}\n";
  MMtext += "objectives{\n";
  MMtext +=
    "resources: " + min(floordiv(crystalCount, 2), 999).toString() + ",0,0\n";
  MMtext += "}\n";
  MMtext += "buildings{\n";
  MMtext +=
    "BuildingToolStore_C\n" +
    "Translation: X=" +
    (base[0][1] * 300 + 150.0).toString() +
    " Y=" +
    (base[0][0] * 300 + 150.0).toString() +
    " Z=" +
    (
      height[base[0][0]][base[0][1]] + (_pj.in_es6("udts", params) ? 50 : 0)
    ).toString() +
    " Rotation: P=" +
    (_pj.in_es6("udts", params) ? "180" : "0") +
    ".000000 Y=89.999992 R=0.000000 Scale X=1.000 Y=1.000 Z=1.000\n" +
    "Level=1\n" +
    "Teleport=True\n" +
    "Health=MAX\n" +
    "Powerpaths=X=" +
    (
      floordiv(walls[0].length, 8) * floordiv(base[0][0], 8) +
      floordiv(base[0][1], 8)
    ).toString() +
    " Y=" +
    (base[0][0] % 8).toString() +
    " Z=" +
    (base[0][1] % 8).toString() +
    "/X=" +
    (
      floordiv(walls[0].length, 8) * floordiv(base[0][0] + 1, 8) +
      floordiv(base[0][1], 8)
    ).toString() +
    " Y=" +
    ((base[0][0] + 1) % 8).toString() +
    " Z=" +
    (base[0][1] % 8).toString() +
    "/\n";
  MMtext += "}\n";
  MMtext += "landslideFrequency{\n";
  for (let i = 1, _pj_a = landslideList.length + 1; i < _pj_a; i += 1) {
    if (landslideList[i - 1].length) {
      MMtext += (i * landslideInterval).toString() + ":";
    }
    for (
      let _pj_d = 0, _pj_b = landslideList[i - 1], _pj_c = _pj_b.length;
      _pj_d < _pj_c;
      _pj_d += 1
    ) {
      const space = _pj_b[_pj_d];
      MMtext += space[1].toString() + "," + space[0].toString() + "/";
    }
    if (landslideList[i - 1].length) {
      MMtext += "\n";
    }
  }
  MMtext += "}\n";
  MMtext += "lavaspread{\n";
  for (let i = 1, _pj_a = flowList.length + 1; i < _pj_a; i += 1) {
    if (flowList[i - 1].length) {
      MMtext += (i * flowInterval).toString() + ":";
    }
    for (
      let space, _pj_d = 0, _pj_b = flowList[i - 1], _pj_c = _pj_b.length;
      _pj_d < _pj_c;
      _pj_d += 1
    ) {
      space = _pj_b[_pj_d];
      MMtext += space[1].toString() + "," + space[0].toString() + "/";
    }
    if (flowList[i - 1].length) {
      MMtext += "\n";
    }
  }
  MMtext += "}\n";
  MMtext += "miners{\n";
  MMtext += "}\n";
  MMtext += "briefing{\n";
  MMtext +=
    "You must collect " +
    min(floordiv(crystalCount, 2), 999).toString() +
    " energy crystals.  \n";
  MMtext += "}\n";
  return MMtext;
}

function countAccessibleCrystals(array: Array2D, base: Point, crystalArray: Array2D, vehicles: boolean) {
  const spaces = [base];
  const tmap = createArray(array.length, array[0].length, -1);
  const types = vehicles
    ? [0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 13]
    : [0, 1, 2, 3, 8, 9, 10, 11, 13];
  for (let i = 1, _pj_a = array.length - 1; i < _pj_a; i += 1) {
    for (let j = 1, _pj_b = array[0].length - 1; j < _pj_b; j += 1) {
      if (_pj.in_es6(array[i][j], types)) {
        tmap[i][j] = 0;
      }
    }
  }
  tmap[base[0]][base[1]] = 1;
  let i = 0;
  while (i < spaces.length) {
    const [x, y] = spaces[i];
    if (tmap[x - 1][y] === 0) {
      tmap[x - 1][y] = 1;
      spaces.push([x - 1, y]);
    }
    if (tmap[x + 1][y] === 0) {
      tmap[x + 1][y] = 1;
      spaces.push([x + 1, y]);
    }
    if (tmap[x][y - 1] === 0) {
      tmap[x][y - 1] = 1;
      spaces.push([x, y - 1]);
    }
    if (tmap[x][y + 1] === 0) {
      tmap[x][y + 1] = 1;
      spaces.push([x, y + 1]);
    }
    i += 1;
  }
  let count = 0;
  for (
    let space, _pj_c = 0, _pj_a = spaces, _pj_b = _pj_a.length;
    _pj_c < _pj_b;
    _pj_c += 1
  ) {
    space = _pj_a[_pj_c];
    count += crystalArray[space[0]][space[1]];
  }
  return count;
}