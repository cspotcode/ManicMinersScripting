import { generateDefaultParameters, attemptGenerationWithRetries, mapgen } from "./map-generator";

$(() => {
    $('#generate').on('click', () => {
        onGenerateClicked();
    });
    $('#download').on('click', () => {
        onDownloadClicked();
    });
});

let map: ReturnType<typeof mapgen> = null;

function onGenerateClicked() {
    const canvasElement = $('canvas')[0] as HTMLCanvasElement;
    const params = generateDefaultParameters();
    const {success, map: _map} = attemptGenerationWithRetries(params);
    if(success) {
        map = _map;
        map!.renderToCanvas(canvasElement);
    }
}

function onDownloadClicked() {
    const mapText = map.convertToMM();
    download(mapText, 'level.dat');
}

function download(data: string, filename: string) {
  const blob = new Blob([data], {type : 'application/text'});
  const url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
