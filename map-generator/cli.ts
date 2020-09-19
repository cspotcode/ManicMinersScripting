import { attemptGenerationWithRetries } from "./map-generator";
import { each, has } from "lodash";
import { input } from "./python-shims/globals";
import * as os from "./python-shims/os";
import { writeFileSync } from "fs";
import { generateDefaultParameters, Parameters } from "./parameters";

function main() {
  const parameters: Parameters = generateDefaultParameters();
  const yargsParsed = require('yargs').parse();
  each(yargsParsed, (v, k) => {
    if(has(parameters, k)) {
      parameters[k] = v;
    }
  });
  const {map, success} = attemptGenerationWithRetries(parameters);
  if (!success) {
    console.log("Unable to create a map with those parameters");
  } else {
    if (parameters["save"] === true) {
      saveFile(parameters["name"], map!.convertToMM());
    }
  }
  if (parameters["stats"]) {
    input();
  }
}
function saveFile(filename: string, content: string) {
  filename = filename.replace(" ", "");
  let counter = 0;
  while (
    os.path.isfile(filename + (counter ? counter.toString() : "") + ".dat")
  ) {
    counter += 1;
  }
  filename += (counter ? counter.toString() : "") + ".dat";
  writeFileSync(filename, content);
  console.log("Saved to:", filename);
  console.log("   ", os.path.join(os.getcwd(), filename));
  console.log();
}

main();