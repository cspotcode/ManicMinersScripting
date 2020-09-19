import { Array2D, conversion, Point } from "./map-generator";

export function displayPNG(
  wallArray: Array2D,
  crystalArray: Array2D,
  oreArray: Array2D,
  landslideList: Point[][],
  flowList: Point[][],
  canvasElement: HTMLCanvasElement
) {
  const context = canvasElement.getContext("2d");
  const scale = 14;
  const borderSize = 0;
  const dotSize = 2;
  const dotInset = 2;
  const dotSpacing = 1;

  const heightPx = wallArray.length * scale;
  const widthPx = wallArray[0].length * scale;
  canvasElement.setAttribute('width', `${ widthPx }`);
  canvasElement.setAttribute('height', `${ heightPx }`);
  context.fillStyle = 'black';
  context.fillRect(0, 0, widthPx, heightPx);
  const colors = {
    "1": [24, 0, 59],
    "101": [24, 0, 59],
    "26": [166, 72, 233],
    "30": [139, 43, 199],
    "34": [108, 10, 163],
    "38": [59, 0, 108],
    "11": [6, 45, 182],
    "111": [6, 45, 182],
    "6": [239, 79, 16],
    "106": [239, 79, 16],
    "63": [56, 44, 73],
    "163": [56, 44, 73],
    "12": [150, 150, 0],
    "112": [150, 150, 0],
    "42": [185, 255, 25],
    "46": [146, 62, 20],
    "50": [250, 255, 14],
    "14": [190, 190, 190],
    "114": [190, 190, 190],
  } as const;
  for (let i = 0, _pj_a = wallArray.length; i < _pj_a; i += 1) {
    for (let j = 0, _pj_b = wallArray[0].length; j < _pj_b; j += 1) {
      context.fillStyle = colorToRgb(colors[conversion[wallArray[i][j]]]);
      context.fillRect(
        j * scale + borderSize,
        i * scale + borderSize,
        scale - borderSize * 2,
        scale - borderSize * 2
      );
      if (crystalArray[i][j] > 0) {
        context.fillStyle = colorToRgb(colors["42"]);
        context.fillRect(
          j * scale + dotInset,
          i * scale + scale - dotInset - dotSize,
          dotSize,
          dotSize
        );
      }
      if (oreArray[i][j] > 0) {
        context.fillStyle = colorToRgb(colors["46"]);
        context.fillRect(
          j * scale + dotInset + dotSize + dotSpacing,
          i * scale + scale - dotInset - dotSize,
          dotSize,
          dotSize
        );
      }
    }
  }
  //   img = img.rotate(270);
  //   img.show();
}

function colorToRgb(color: readonly [number, number, number]) {
    const [r, g, b] = color;
    return `rgb(${r}, ${g}, ${b})`;
}