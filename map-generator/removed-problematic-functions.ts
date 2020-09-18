export {};
function displayPNG(wallArray, crystalArray, oreArray, landslideList, flowList) {
    import {Image, ImageDraw} from 'PIL';
    let colors, draw, img, scale;
    scale = 14;
    img = Image.new_jscompat("RGB", [((wallArray[0].length * scale) + 1), ((wallArray.length * scale) + 1)], {"color": [0, 0, 0]});
    colors = {"1": [24, 0, 59], "101": [24, 0, 59], "26": [166, 72, 233], "30": [139, 43, 199], "34": [108, 10, 163], "38": [59, 0, 108], "11": [6, 45, 182], "111": [6, 45, 182], "6": [239, 79, 16], "106": [239, 79, 16], "63": [56, 44, 73], "163": [56, 44, 73], "12": [150, 150, 0], "112": [150, 150, 0], "42": [185, 255, 25], "46": [146, 62, 20], "50": [250, 255, 14], "14": [190, 190, 190], "114": [190, 190, 190]};
    draw = new ImageDraw.Draw(img);
    for (let i = 0, _pj_a = wallArray.length; (i < _pj_a); i += 1) {
        for (let j = 0, _pj_b = wallArray[0].length; (j < _pj_b); j += 1) {
            draw.rectangle([((j * scale) + 1), ((i * scale) + 1), ((j * scale) + (scale - 1)), ((i * scale) + (scale - 1))], {"fill": colors[wallArray[i][j]]});
            if ((crystalArray[i][j] > 0)) {
                draw.rectangle([((j * scale) + 2), (((i * scale) + scale) - 4), ((j * scale) + 4), (((i * scale) + scale) - 2)], {"fill": colors["42"]});
            }
            if ((oreArray[i][j] > 0)) {
                draw.rectangle([((j * scale) + 5), (((i * scale) + scale) - 4), ((j * scale) + 7), (((i * scale) + scale) - 2)], {"fill": colors["46"]});
            }
        }
    }
    img = img.rotate(270);
    img.show();
}
function isBool(s) {
  if (s === "True" || s === "true" || s === "False" || s === "false") {
    return true;
  }
  return false;
}
function isFloat(s) {
  try {
    Number.parseFloat(s);
    return true;
  } catch (e) {
    if (e instanceof ValueError) {
      return false;
    } else {
      throw e;
    }
  }
}
function isInt(s) {
  try {
    Number.parseInt(s);
    return true;
  } catch (e) {
    if (e instanceof ValueError) {
      return false;
    } else {
      throw e;
    }
  }
}
function isTrue(s) {
  if (s === "True" || s === "true") {
    return true;
  }
  return false;
}