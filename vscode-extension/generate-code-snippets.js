#!/usr/bin/env node

const { capitalize } = require('lodash');
const fs = require('fs');
const Path = require('path');

/*
 * This script generates the snippets which are bundled into the VSCode extension.
 */

const snippets = {};

//can be found here https://manicminers.fandom.com/wiki/Scripting#Variable_Types
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

const macros = [{
  name: 'erosionscale',
  description: 'Parameter that scales erosion rate globally.'
}];

for(const macro of macros) {
    const {name, description} = macro;
    snippets[`macro: ${ name }`] = {
        prefix: `Macro_${ name }`,
        body: [name],
	description
    };
}

//a full list of the vehicles cann be found here https://manicminers.fandom.com/wiki/Classes#Vehicles
/** @type {Array<{name: string, className: string}>} */
const vehicles = [{
    name: 'Small Digger',
    className: 'VehicleSmallDigger_C'
},
{
	name: 'Hover Scout',
	className: 'VehicleHoverScout_C'
},
{
	name: 'Small Transport Truck',
	className: 'VehicleSmallTransportTruck_C'
},
{
	name: 'Small Mobile Laser Cutter',
	className: 'VehicleSMLC_C'
},
{
	name: 'Rapid Rider',
	className: 'VehicleRapidRider_C'
},
{
	name: 'Tunnel Scout',
	className: 'VehicleTunnelScout_C'
},
{
	name: 'Loader Dozer',
	className: 'VehicleLoaderDozer_C'
},
{
	name: 'Granite Grinder',
	className: 'VehicleGraniteGrinder_C'
},
{
	name: 'Chrome Crusher',
	className: 'VehicleChromeCrusher_C'
},
{
	name: 'Large Mobile Laser Cutter',
	className: 'VehicleLMLC_C'
},
{
	name: 'Cargo Carrier',
	className: 'VehicleCargoCarrier_C'
},
{
	name: 'Tunnel Transport',
	className: 'VehicleTunnelTransport_C'
}];

for(const vehicle of vehicles) {
    const {className, name} = vehicle;
    snippets[`vehicle ${name}`] = {
        description: `Class name for ${ name }`,
        prefix: className,
        body: className,
    };
}

//a full list of the buildings cann be found here https://manicminers.fandom.com/wiki/Classes#Buildings
/** @type {Array<{name: string, className: string}>} */
const buildings = [{
	name: 'Tool Store',
    className: 'BuildingToolStore_C'
},
{
	name: 'Teleport Pad',
    className: 'BuildingTeleportPad_C'
},
{
	name: 'Docks',
    className: 'BuildingDocks_C'
},
{
	name: 'Power Station',
    className: 'BuildingPowerStation_C'
},
{
	name: 'Support Station',
    className: 'BuildingSupportStation_C'
},
{
	name: 'Upgrade Station',
    className: 'BuildingUpgradeStation_C'
},
{
	name: 'Geological Center',
    className: 'BuildingGeologicalCenter_C'
},
{
	name: 'Ore Refinery',
    className: 'BuildingOreRefinery_C'
},
{
	name: 'Mining Laser',
    className: 'BuildingMiningLaser_C'
},
{
	name: 'Super Teleport',
    className: 'BuildingSuperTeleport_C'
},
{
	name: 'Electric Fence',
    className: 'BuildingElectricFence_C'
},
{
	name: 'Power Path',
    className: 'BuildingPowerPath_C'
},
{
	name: 'Erosion Repair',
    className: 'BuildingErosionRepair_C'
}]

for(const building of buildings) {
    const {className, name} = building;
    snippets[`building ${name}`] = {
        description: `Class name for ${ name } more infos under https://manicminers.fandom.com/wiki/Classes#Buildings`,
        prefix: className,
        body: className,
    };
}

// All other snippets
Object.assign(snippets, {
	// --------------------------- OCCURENCE -----------------------------------------------------
	//can be found here https://manicminers.fandom.com/wiki/Scripting#OCCURENCE
	"When": {
		"prefix": "when()",
		"body": "when(${1:Trigger})[${2:Event}]"
	},
	"If": {
		"prefix": "if()",
		"body": "if(${1:Trigger})[${2:Event}]"
	},
	// --------------------------- CONDITIONS -----------------------------------------------------
	//can be found here https://manicminers.fandom.com/wiki/Scripting#CONDITION_.28optional.29
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
	//can be found here https://manicminers.fandom.com/wiki/Scripting#Variables
	"Random": {
		"prefix": "random()()",
		"body": "random($1)($2)",
		"description": "Creates a random integer or float"
	},
	// --------------------------- TRIGGERS -----------------------------------------------------
	//can be found here https://manicminers.fandom.com/wiki/Scripting#Triggers
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
	//can be found here https://manicminers.fandom.com/wiki/Scripting#Events
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
		"body": "sound:${1:sound_name}",
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
	//can be found here https://manicminers.fandom.com/wiki/Scripting#Player_interaction
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
	},
	//------------------ added some blocks from *.dat file----------------------------
	    "comments": {
        "prefix": "comments",
        "body": [
            "comments \{\n\t${1|MyComment,YourComment|}\n\}"
        ],
        "description": "Placeholder for comments"
	},
		"info": {
			"prefix" : "info",
			"body" : [
				"info\{\nrowcount:${1:int}\ncolcount:${2:int}\ncamerapos:Translation: X=${3:double} Y=${4:double} Z=${5:double} Rotation: P=${6:double} Y=${7:double} R=${8:double} Scale X=${9:double} Y=${10:double} Z=${11:double}\nbiome:${12:biomName}\ncreator:${13:MMSkript}\nerosioninitialwaittime:${14:int}\nversion:${15:yyyy-mm-dd-v}\ncamerazoom:${16:double}\nerosionscale:${17:double}\noxygen:${18:int/3000}\nspiderchance:${19:double}\n\}"
			],
			"description" : "info block which contains rowcount, colcount, camerapos, biome, creator, erosioninitalwaittime, version, camerazomm, erosionscale, oxygen, spiderchance"
	},
		"BuildingPosition": {
			"prefix" : "", //-> when a building is in buildings tag, position is needed
			"body" : [
					"\nTranslation: X=${1:double} Y=${2:double} Z=${3:double} Rotation: P=${4:double} Y=${5:double} R=${6:double} Scale X=${7:double} Y=${8:double} Z=${9:double}"
			],
			"description" : "Define position of building"
		},
  "Event: tick": {
    "prefix": "EventTick",
    "body": ["tick::;\n"],
    "description": "Reserved event chain that fires every frame."
  }
});

//Nice to know
//Placeholders:
//${1:comment} -> will write comment
//${1|comment, comment2|}, will open a new menu, where you can choose between, the two options

// Here we write the snippets to disk
fs.writeFileSync(Path.resolve(__dirname, 'snippets.json'), JSON.stringify(snippets, null, 2));
