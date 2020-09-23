#!/usr/bin/env node

/*
 * THIS SCRIPT DOES NOT WORK YET
 * It's a "stub" file, showing what work still needs to be done.
 *
 * This is a program that will create the snippets file.
 * Eventually, we will run it automatically on Github's servers,
 * and host the output snippets file on Github for anyone to download.
 *
 * When contributors send us improvements to this program, it will automatically
 * re-run and host the new snippets on Github for anyone to download.
 */

// List of all vehicle class names.  We can use this list to generate the same snippets for each vehicle.
const allVehicleNames = [...];

// There are other useful lists of names which we will want to use for generating snippets
const otherArrayOfUsefulInfo = [...];

// Here we will use loops to create all the snippets. We will build a JSON object which will be written to disk
const snippets = ...;

// Here we write the snippets to disk, overwriting `.vscode/manic-miners.code-snippets`
// We can also do additional things here.  For example, we can publish the file to Github for others to download.
fs.writeFileSync('.vscode/manic-miners.code-snippets', snippets);
