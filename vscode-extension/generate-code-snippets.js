#!/usr/bin/env node

const { capitalize } = require('lodash');
const fs = require('fs');
const Path = require('path');

/*
 * This script generates the snippets which are bundled into the VSCode extension.
 */

const snippets = {};

/** @type {Array<{name: string; keyword?: string}>} */
const variableTypes = [{
    name: 'string',
}, {
    name: 'integer',
    keyword: 'int'
}, {
    name: 'float',
}, {
    name: 'miner',
}, {
    name: 'vehicle',
}, {
    name: 'building',
}, {
    name: 'arrow',
}];

for(const variableType of variableTypes) {
    const {name, keyword = name} = variableType;
    snippets[`variable declaration: ${ name }`] = {
        prefix: name,
        body: `${keyword} `,
        description: `Creates a ${name} variable`
    };
}

// TODO add all the other vehicle names here

/** @type {Array<{name: string, className: string}>} */
const vehicles = [{
    name: 'Small Digger',
    className: 'VehicleSmallDigger_C'
}];

for(const vehicle of vehicles) {
    const {className, name} = vehicle;
    snippets[`vehicle ${name}`] = {
        description: `Class name for ${ name }`,
        prefix: className,
        body: className,
    };
}

// All other snippets
Object.assign(snippets, {
	// --------------------------- OCCURENCE -----------------------------------------------------
	"When": {
		"prefix": "when()",
		"body": "when(${1:Trigger})[${2:Event}]"
	},
	"If": {
		"prefix": "if()",
		"body": "if(${1:Trigger})[${2:Event}]"
	},
	// --------------------------- CONDITIONS -----------------------------------------------------
	"IfCond": {
		"prefix": "comp",
		"body": "((${1:Variable1}${2|>,>=,<=,<,==,!=|}${3:Variable2}))[$0]",
		"description": "Conditional event, executes only if condition is true"
	},
	"IfElseCond": {
		"prefix": "comp",
		"body": "((${1:Variable1}${2|>,>=,<=,<,==,!=|}${3:Variable2}))[$0][]",
		"description": "Conditional event, executes first event if condition is true, second event otherwise"
	},
	// --------------------------- VARIABLES -----------------------------------------------------
	"Random": {
		"prefix": "random()()",
		"body": "random($1)($2)",
		"description": "Creates a random integer or float"
	},
	// --------------------------- TRIGGERS -----------------------------------------------------
	"Drill_1": {
		"prefix": "TriggerDrill",
		"body": "drill:${1:row},${2:column}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is drilled, or the wall there collapses."
	},
	"Laser": {
		"prefix": "TriggerLaser",
		"body": "laser:${1:row},${2:column}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is destroyed by a laser."
	},
	"Laserhit": {
		"prefix": "TriggerLaserhit",
		"body": "laserhit:${1:row},${2:column}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is hit by a laser, but not destroyed."
	},
	"Change": {
		"prefix": "TriggerChange",
		"body": "change:${1:row},${2:column}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is changed in any way. This includes reinforcing, shoveling once, drilling, finding a cave etc. Optionally add a ID requirement for the trigger to fire only if the tile is changed to a specific tile ID."
	},
	"Change(ID)": {
		"prefix": "TriggerChange(ID)",
		"body": "change:${1:row},${2:column},${3:tileID}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is changed in any way. This includes reinforcing, shoveling once, drilling, finding a cave etc. Optionally add a ID requirement for the trigger to fire only if the tile is changed to a specific tile ID."
	},
	"Reinforce": {
		"prefix": "TriggerReinforce",
		"body": "reinforce:${1:row},${2:column}",
		"description": "Call the corresponding event when a wall at ROW,COLUMN is reinforced by any unit."
	},
	"Time": {
		"prefix": "TriggerTime",
		"body": "time:${1:row},${2:column}",
		"description": "Call the corresponding event when SECONDS seconds have been reached. Supports decimal floats."
	},
	"Hover": {
		"prefix": "TriggerHover",
		"body": "hover:${1:row},${2:column}",
		"description": "Activates when the player hovers that tile. The tile has to be visible."
	},
	"Click": {
		"prefix": "TriggerClick",
		"body": "click:${1:row},${2:column}",
		"description": "Activates when the player clicks that tile. The tile has to be visible."
	},
	"Walk": {
		"prefix": "TriggerWalk",
		"body": "walk:${1:row},${2:column}",
		"description": "Activates when a class walks on a tile. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},
	"Walk(Name)": {
		"prefix": "TriggerWalk(Name)",
		"body": "walk:${1:row},${2:column},${3:name}",
		"description": "Activates when a class walks on a tile. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},
	"Drive": {
		"prefix": "TriggerDrive",
		"body": "drive:${1:row},${2:column}",
		"description": "Activates when a class is driven over a tile. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},
	"Drive(Name)": {
		"prefix": "TriggerDrive(Name)",
		"body": "drive:${1:row},${2:column},${3:name}",
		"description": "Activates when a class is driven over a tile. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},
	"Enter": {
		"prefix": "TriggerEnter",
		"body": "enter:${1:row},${2:column}",
		"description": "Activates when a class enters a tile, either miner or vehicle. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},
	"Enter(Name)": {
		"prefix": "TriggerEnter(Name)",
		"body": "enter:${1:row},${2:column},${3:name}",
		"description": "Activates when a class enters a tile, either miner or vehicle. Optionally add a NAME requirement to make the trigger fire only for a specific class.*"
	},	
	// --------------------------- EVENTS -----------------------------------------------------
	"Drill_2": {
		"prefix": "EventDrill",
		"body": "drill:${1:row},${2:column}",
		"description": "Drill tile ROW,COLUMN. It will play the appropriate effect and place rubble, ignoring what tile it is.*"
	},
	"Message": {
		"prefix": "EventMessage",
		"body": "msg:${1:message}",
		"description": "Display the message string MsgStr, as defined above."
	},
	"Place": {
		"prefix": "EventPlace",
		"body": "place:${1:row},${2:column},${3:tileID}",
		"description": "Place tile with ID at ROW,COLUMN. You can find IDs of the tiles here.**"
	},
	"Wait": {
		"prefix": "EventWait",
		"body": "wait:${1:game_seconds}",
		"description": "Ask the game to wait a set amount of seconds before executing the next command. Only supported within an event chain. Scales with game speed."
	},
	"Truewait": {
		"prefix": "EventTruewait",
		"body": "truewait:${1:real_seconds}",
		"description": "Ask the game to wait a set amount of seconds before executing the next command. Only supported within a event chain. Does not scale with game speed."
	},
	"Win": {
		"prefix": "EventWin",
		"body": "win:${1:message}",
		"description": "Player wins the level with the message defined by string MsgStr. If no string is supplied, they win the level anyway."
	},
	"Lose": {
		"prefix": "EventLose",
		"body": "lose:${1:message}",
		"description": "Player loses the level with the message defined by string MsgStr. If no string is supplied, they lose the level anyway."
	},
	"Sound": {
		"prefix": "EventSound",
		"body": "lose:${1:sound_name}",
		"description": "Plays the .ogg file of that name from /ManicMiners/Levels/ASSETS/Sounds (do not include the \".ogg\" extension in the script)"
	},
	"Pan": {
		"prefix": "EventPan",
		"body": "pan:${1:row},${2:column}",
		"description": "The player's camera pans to the tile at ROW,COLUMN"
	},
	"Shake": {
		"prefix": "EventShake",
		"body": "shake:${1:float}",
		"description": "The player's camera shakes with magnitude 1.0. The magnitude has no limit."
	},
	"Save": {
		"prefix": "EventSave",
		"body": "save:${1:last_triggered_unit}",
		"description": "Saves the last unit who activated a trigger into a variable. Can be combined with walk/drive/enter triggers for example."
	},
	// --------------------------- PLAYER EVENTS -----------------------------------------------------
	"Reset": {
		"prefix": "EventReset",
		"body": "reset",
		"description": "Resets the player's selection (equivalent to a right-click)"
	},
	"Pause": {
		"prefix": "EventPause",
		"body": "pause",
		"description": "Pauses the game. A bit weird right now as it stops the camera lag effect. The player can unpause with the pause button (P)"
	},
	"Unpause/Resume": {
		"prefix": "EventUnpause/Resume",
		"body": "resume",
		"description": "Resumes the game if paused. Note that since time does not pass while the game is paused, even with truewait, this can only be called via player interaction such as clicks."
	},
	"Speed": {
		"prefix": "EventSpeed",
		"body": "speed:${1:float}",
		"description": "Sets the game speed to NEW_SPEED temporarily. The speed does not save and should only be used in specific instances, like a slow motion sequence. Does not prevent the player from increasing the speed in settings."
	},
	"Resetspeed": {
		"prefix": "EventResetspeed",
		"body": "resetspeed",
		"description": "Loads the game speed from settings again"
    }
});

// Here we write the snippets to disk
fs.writeFileSync(Path.resolve(__dirname, 'snippets.json'), JSON.stringify(snippets, null, 2));
