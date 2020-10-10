/*
 * THIS FILE NOT USED
 * I was gonna use chevrotain to parse maps,
 * then realized the format seems designed for a hackier style of
 * parsing.
 */

import {createToken, ITokenConfig, Lexer, TokenType} from 'chevrotain';
import {mapValues} from 'lodash';

function createTokens<K extends string>(tokenDefinitions: Record<K, Omit<ITokenConfig, 'name') {
    const ret = {} as {[K2 in K]: TokenType};
    for(const entry of Object.entries(tokenDefinitions)) {
        const [name, definition] = entry as [string, Omit<ITokenConfig, 'name'>];
        ret[name] = createToken({
            name,
            ...definition
        });
    }
    return ret;
}

const lexerModes = {
    map: 'map',
    textBlock: 'textBlock',
    infoBlock: 'infoBlock',
    csvGrid: 'csvGrid',
    resourcesBlock: 'resourcesBlock',
    objectivesBlock: 'objectivesBlock',
    // buildings, 
    unitsBlock: 'unitsBlock',
    tileFrequenciesBlock: 'tileFrequenciesBlock'
} as const;

const identifier = createToken({
    name: 'identifier',
    pattern: /[a-zA-Z][a-zA-Z0-9]/
});

const mapBlockNameIdentifiers = createTokens({
    identifier_comments: {pattern: /comments/},
    identifier_info: {pattern: /comments/},
    identifier_tiles: {pattern: /comments/},
    identifier_height: {pattern: / /},
    identifier_resources: {pattern: / /},
    identifier_objectives: {pattern: /objectives/},
    identifier_buildings: {pattern: /buildings/},
    identifier_landslidefrequency: {pattern: /landslidefrequency/},
    identifier_lavaspread: {pattern: /lavaspread/},
    identifier_miners: {pattern: /miners/},
    identifier_briefing: {pattern: /briefing/},
    identifier_vehicles: {pattern: /vehicles/},
    identifier_script: {pattern: /script/},
})

const integer = createToken({
    name: 'integer',
    pattern: /-?[0-9]+/
});
const float = createToken({
    name: 'float',
    pattern: /-?[0-9]+\.[0-9]+/
});

const whitespace = createToken({
    name: 'whitespace',
    pattern: /[ \t]+/,
    group: Lexer.SKIPPED
});

const curlyBraceOpen = createToken({
    name: 'curlyBraceOpen',
    pattern: /{/
});
const curlyBraceClose = createToken({
    name: 'curlyBraceClose',
    pattern: /}/
});

 [
    whitespace,
    // "keywords" appear before the Identifier
    identifier,
    float,
    integer,
    curlyBraceOpen,
    curlyBraceClose,
];

export const mapLexer = new Lexer({
    defaultMode: lexerModes.map,
    modes: {
        map: [
            whitespace,
        ]
    }
});