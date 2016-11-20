var DitV = DitV || {
    GRID_SIZE: 70,
    BOX_WIDTH: 6,
    BOX_HEIGHT: 4,
    MAX_BOXES_IN_ROW: 4,
    BUFFER_X: 1,
    BUFFER_Y: 3,
    CHIP_HEIGHT: 10,
    CHIP_START: 2,

    MAX_VALUE: 10,

    DEFAULT_URLS: {
	1: "https://s3.amazonaws.com/files.d20.io/images/25257879/PPWgkdqVmmJaeVXWnmUyQw/thumb.png?1479109676",
	2: "https://s3.amazonaws.com/files.d20.io/images/25258015/vxFLvSDx-QBt5cQysnKJMA/thumb.png?1479110113",
	3: "https://s3.amazonaws.com/files.d20.io/images/25258014/CYpjebR9-lNSsE_XbPhsvw/thumb.png?1479110113",
	4: "https://s3.amazonaws.com/files.d20.io/images/25258012/FLloQfZSL0eoHagJe4hHKg/thumb.png?1479110113",
	5: "https://s3.amazonaws.com/files.d20.io/images/25258009/qO18H1sE_ylJ3qKSpS5IFQ/thumb.png?1479110113",
	6: "https://s3.amazonaws.com/files.d20.io/images/25258016/oiJUuvmd_y_eaTv3fqwdGw/thumb.png?1479110113",
	7: "https://s3.amazonaws.com/files.d20.io/images/25258011/6tJNwplOuZ-5K9VxFUDh_Q/thumb.png?1479110113",
	8: "https://s3.amazonaws.com/files.d20.io/images/25258013/30gzSNDtZzGR6XJqbB7r3A/thumb.png?1479110113",
	9: "https://s3.amazonaws.com/files.d20.io/images/25258008/1rLZrMbaV7w2s3SfbgS8yQ/thumb.png?1479110113",
	10: "https://s3.amazonaws.com/files.d20.io/images/25258010/mmJxy8FhvEY62-BIKeAYKQ/thumb.png?1479110113"
    },
    GENERIC_URL: "https://s3.amazonaws.com/files.d20.io/images/8713360/xSx7ppXB9KD2hIvGf64TaQ/thumb.png?1428459149",


    init: function(){
	if (!state.hasOwnProperty('DitV')){ state.DitV = {}; }
	if (!state.DitV.hasOwnProperty('characters')){ state.DitV.characters = {}; }
	if (!state.DitV.hasOwnProperty('chipImages')){ state.DitV.chipImages = {}; }
	if (!state.DitV.CHIP_URLS){ state.DitV.CHIP_URLS = {}; }
	for (var i = 1; i <= DitV.MAX_VALUE; i++){
	    if ((!state.DitV.CHIP_URLS[i]) && (DitV.DEFAULT_URLS[i])){
		state.DitV.CHIP_URLS[i] = DitV.DEFAULT_URLS[i];
	    }
	}
	DitV.MAX_STACK = Math.floor(DitV.GRID_SIZE / DitV.CHIP_HEIGHT);
    },
    
    determineCoordinates: function(characterCount) {
        var row = 0;
        var column = 0;
        for (var i = 0; i < characterCount; i = i + 1) {
            column = column + 1;
            if (column >= DitV.MAX_BOXES_IN_ROW) {
                column = 0;
                row = row + 1;
            }
        }
        return ({'x': (DitV.BUFFER_X) + (DitV.BOX_WIDTH * column) + (DitV.BUFFER_X * column), 'y': (DitV.BUFFER_Y) + (DitV.BOX_HEIGHT * row) + (DitV.BUFFER_Y * row) });
    },

    addCharacter: function(name, color){
	var pageId = Campaign().get('playerpageid');
	if (!pageId){ return "Unable to determine player page."; }
	if (state.DitV.characters[name]){ return "Character '" + name + "' already registered."; }
	var coordinates = DitV.determineCoordinates(Object.keys(state.DitV.characters).length);
	var x = coordinates['x'];
	var y = coordinates['y'];
	log('Coordinates for ' + name + ': ' + x + ', ' + y);
    log(pageId);

	
	if (!color){ color = "#ffff00"; }
	var path = [["M", 0, 0], ["L", DitV.BOX_WIDTH * DitV.GRID_SIZE, 0], ["L", DitV.BOX_WIDTH * DitV.GRID_SIZE, DitV.BOX_HEIGHT * DitV.GRID_SIZE],
		    ["L", 0, DitV.BOX_HEIGHT * DitV.GRID_SIZE], ["L", 0, 0]];
	var box = createObj("path", {
				    _pageid:		pageId,
				    _path:		JSON.stringify(path),
				    stroke:		color,
				    left:		x * DitV.GRID_SIZE + DitV.BOX_WIDTH * DitV.GRID_SIZE / 2,
				    top:		y * DitV.GRID_SIZE + DitV.BOX_HEIGHT * DitV.GRID_SIZE / 2,
				    width:		DitV.BOX_WIDTH * DitV.GRID_SIZE,
				    height:		DitV.BOX_HEIGHT * DitV.GRID_SIZE,
				    layer:		"map"});

	var nameTag = createObj("text", {
	    _pageid: pageId,
	    top: (y * DitV.GRID_SIZE)-15,
	    left: x * DitV.GRID_SIZE + DitV.BOX_WIDTH * DitV.GRID_SIZE / 2,
	    text: name,
	    font_family: "Candal",
	    font_size: 20,
	    layer: "map",
	    color: color
	});
	state.DitV.characters[name] = {
	    'x':	x,
	    'y':	y,
	    'box':	box.id,
	    'nameTag': nameTag.id,
	    'chips':	{}
	};
	
    },

    removeCharacter: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var error = DitV.clearChips(name);
	if (state.DitV.characters[name]['box']){
	    var box = getObj("path", state.DitV.characters[name]['box']);
	    if (box){ box.remove(); }
	    delete state.DitV.characters[name]['box'];
	}
	if (state.DitV.characters[name]['nameTag']){
	    var nameTag = getObj("text", state.DitV.characters[name]['nameTag']);
	    if (nameTag) {nameTag.remove(); }
	    delete state.DitV.characters[name]['nameTag'];
	}
	delete state.DitV.characters[name];
	DitV.reflowCharacters();
	return error;
    },
    
    reflowCharacters: function() {
        var characterCount = 0;
        for (var name in state.DitV.characters) {
            var box = getObj("path", state.DitV.characters[name]['box']);
            var nameTag = getObj("text", state.DitV.characters[name]['nameTag']);
            var coordinates = DitV.determineCoordinates(characterCount);
	        var x = coordinates['x'];
	        var y = coordinates['y'];
	        if (box) {
	            box.set("left", x * DitV.GRID_SIZE + DitV.BOX_WIDTH * DitV.GRID_SIZE / 2);
	            box.set("top", y * DitV.GRID_SIZE + DitV.BOX_HEIGHT * DitV.GRID_SIZE / 2);
	        }
	        if (nameTag) {
	            nameTag.set("top", (y * DitV.GRID_SIZE) - 15);
	            nameTag.set("left", x * DitV.GRID_SIZE + DitV.BOX_WIDTH * DitV.GRID_SIZE / 2);
	        }
	        state.DitV.characters[name]['x'] = x;
	        state.DitV.characters[name]['y'] = y;
	        DitV.restackChips(name);
            characterCount = characterCount + 1;
        }
    },

    clearChips: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	for (var value in state.DitV.characters[name]['chips']){
	    while ((state.DitV.characters[name]['chips'][value]) && (state.DitV.characters[name]['chips'][value].length > 0)){
		var token = getObj("graphic", state.DitV.characters[name]['chips'][value].pop());
		if (token){ token.remove(); }
	    }
	}
	state.DitV.characters[name]['chips'] = {};
    },
    
    addChip: function(name, value){
	var pageId = Campaign().get('playerpageid');
	if (!pageId){ return "Unable to determine player page."; }
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var character = state.DitV.characters[name];
	var pos = value - 1 + DitV.CHIP_START; // position in wrapped list of 1x2 stacks (CHIP_START is the offset past the reserved top-left area)
	var x = (pos % DitV.BOX_WIDTH) + character['x'];
	var y = Math.floor(pos / DitV.BOX_WIDTH) * 2 + character['y'] + 1;
	// translate from squares to pixels, and adjust for the fact that Roll20 uses center instead of top-left for position
	x = (x * DitV.GRID_SIZE) + (DitV.GRID_SIZE / 2);
	y = (y * DitV.GRID_SIZE) + (DitV.GRID_SIZE / 2);
	// offset chip image upwards to place on top of stack
	y -= Math.min((character['chips'][value] ? character['chips'][value].length : 0), DitV.MAX_STACK) * DitV.CHIP_HEIGHT;
	var token = createObj("graphic", {
					    _subtype:		"token",
					    _pageid:		pageId,
					    imgsrc:		(state.DitV.CHIP_URLS[value] || DitV.GENERIC_URL),
					    left:		x,
					    top:		y,
					    width:		DitV.GRID_SIZE,
					    height:		DitV.GRID_SIZE,
					    layer:		"objects",
					    isdrawing:		true,
					    controlledby:	"all"
					});
	if (!token){ return "Failed to create token for chip with value " + value; }
	if(!state.DitV.CHIP_URLS[value]){ token.set("status_blue", (value < 10 ? value : true)); }
	if (!character['chips'][value]){ character['chips'][value] = []; }
	character['chips'][value].push(token.id);
    },

    addChips: function(name, counts){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	for (var i = 0; i < counts.length; i++){
	    for (var j = 0; j < counts[i]; j++){
		var error = DitV.addChip(name, i + 1);
		if (error){ return error; }
	    }
	}
    },

    rollChips: function(name, rollSpec){
	var specArray = rollSpec.split(/[+\s]/);
	var rollCounts = new Array(DitV.MAX_VALUE);
	for (var i = 0; i < specArray.length; i++){
	    var spec = specArray[i].split("d");
	    if (spec.length != 2){
		return "Malformed roll specification: " + specArray[i];
	    }
	    var diceCount = parseInt(spec[0]);
	    var dieSize = parseInt(spec[1]);
	    for (j = 0; j < diceCount; j++){
		var roll = randomInteger(dieSize);
		rollCounts[roll - 1] = (rollCounts[roll - 1] || 0) + 1;
	    }
	}
	var error = DitV.addChips(name, rollCounts);
	return error || rollCounts;
    },

    countChips: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var chips = state.DitV.characters[name]['chips'];
	var counts = {};
	for (var value in chips){
	    // prune references to chips whose tokens have been deleted before counting remaining chips
	    chips[value] = chips[value].filter(function(tokenId){ return getObj("graphic", tokenId); });
	    counts[value] = chips[value].length;
	}
	return counts;
    },
    
    fallout: function(name, severity, demonic_influence){
    if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
    var chips = state.DitV.characters[name]['chips'];
    var chipCount = 0;
    var severityCount = 0;
    switch (severity){
	    case 'verbal':
	        severityCount = 4;
            break;
        case 'physical':
            severityCount = 6;
            break;
        case 'weapons':
            severityCount = 8;
            break;
        case 'bullets':
            severityCount = 10;
            break;
        default:
            return "Severity " + severity + " not matched";
    }
    
    for (var value in chips){
	    // prune references to chips whose tokens have been deleted before counting remaining chips
	    chips[value] = chips[value].filter(function(tokenId){ return getObj("graphic", tokenId); });
	    chipCount += chips[value].length;
	}
	var rollCounts = new Array(DitV.MAX_VALUE);
    var diceCount = parseInt(chipCount);
    var dieSize = parseInt(severityCount);
    for (j = 0; j < diceCount; j++){
	var roll = randomInteger(dieSize);
	rollCounts[roll - 1] = (rollCounts[roll - 1] || 0) + 1;
    }
    return rollCounts
    },

    restackChips: function(name){
        if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
        var rollCounts = new Array(DitV.MAX_VALUE);
        var chips = DitV.countChips(name);
 		for (var i = 1; i <= DitV.MAX_VALUE; i++){
		if (chips[i]){
		    rollCounts[i-1] = chips[i]
		}
	    }
	    DitV.clearChips(name);
 		DitV.addChips(name, rollCounts);
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "<").replace(/>/g, ">").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd){
	DitV.write(cmd + " commands:", who, "", "DitV");
	var helpMsg = "";
	helpMsg += "help:               	display this help message\n";
	helpMsg += "add NAME	add character with specified name\n";
	helpMsg += "remove NAME			remove specified character\n";
	helpMsg += "clear NAME			clear specified character's chips\n";
	helpMsg += "roll NAME DICE		roll DICE (e.g. \"3d4+1d6\") and add to specified character's chips\n";
	helpMsg += "count NAME			count specified character's chips and display for all to see\n";
	helpMsg += "addChip NAME VALUE  add a single chip of a specific value\n";
	helpMsg += "fallout NAME SEVERITY DEMONIC_INFLUENCE   determine the fallout from a conflict\n";
	helpMsg += "restackChips NAME   restack the chips for a character\n";
	helpMsg += "setimage VALUE [URL]	set the image URL for the specified chip value (uses selected token's image if no URL specified)\n";
	helpMsg += "images			display a table of chip images\n";
	DitV.write(helpMsg, who, "font-size: small; font-family: monospace", "DitV");
    },

    handleDitVMessage: function(tokens, msg){
	if (tokens.length < 2){
	    return DitV.showHelp(msg.who, tokens[0]);
	}
	var error = "";
	switch (tokens[1]){
	case "add":
	    if (tokens.length <= 2){
		error = "The 'add' command requires one argument: character name";
		break;
	    }
	    error = DitV.addCharacter(tokens[2], getObj('player', msg.playerid).get("color"));
	    break;
	case "remove":
	    if (tokens.length <= 2){
		error = "The 'remove' command requires one argument: character name";
		break;
	    }
	    error = DitV.removeCharacter(tokens[2]);
	    break;
	case "clear":
	    if (tokens.length <= 2){
		error = "The 'clear' command requires one argument: character name";
		break;
	    }
	    error = DitV.clearChips(tokens[2]);
	    break;
	case "addChip":
	    if (tokens.length <= 3){
	    error = "The 'addChip' command requires two arguments: character name and chip size";
	    break;
	    }
	    error = DitV.addChip(tokens[2], tokens[3])
	    DitV.write("Added a chip of value " + tokens[3] + " to " + tokens[2], "", "", msg.who)
	    break;
	case "fallout":
	    if (tokens.length <= 3){
        error = "The 'fallout' command requires two arguments: name and the severity of the conflict"
	    }
	    var rollCounts = DitV.fallout(tokens[2], tokens[3]);
	    if (typeof(rollCounts) == typeof("")){
		error = rollCounts;
	    }
	    else{
	    
		var name = tokens[2] + " rolling for " + tokens[3] + " conflict fallout";
		var dieValues = '';
		var joinStr = " ";
		var rollValues = []
		var experience = false
		for (var i = 0; i <rollCounts.length; i++){
		    for (var j = 0; j < rollCounts[i]; j++){
			dieValues += joinStr + (i + 1);
			rollValues.push(i + 1)
			joinStr = ", ";
		    }
		}
		fallout_total = rollValues[rollValues.length-1] + rollValues[rollValues.length-2];
		if (rollValues[0] == 1) {
		    experience = true
		}
		else {
		    experience = false
		} 
		var rollMsg = "&{template:default}";
		rollMsg += "{{name=" + name + "}}";
		rollMsg += "{{Values= " + dieValues + " }}";
		rollMsg += "{{Fallout Total="+ fallout_total + "}}";
		rollMsg += "{{Experience=" + (experience ? 'Yes' : 'No') +"}}";
		
		DitV.write(rollMsg, "", "", msg.who);
	    }
	    break;
	case "roll":
	    if (tokens.length <= 3){
		error = "The 'roll' command requires two arguments: character name and dice specification";
		break;
	    }
	    var rollSpec = tokens.slice(3).join(" ");
	    var rollCounts = DitV.rollChips(tokens[2], rollSpec);
	    if (typeof(rollCounts) == typeof("")){
		error = rollCounts;
	    }
	    else{
		var rollMsg = tokens[2] + " rolling " + rollSpec.replace(/ /g, "+") + ":";
		var joinStr = " ";
		for (var i = 0; i <rollCounts.length; i++){
		    for (var j = 0; j < rollCounts[i]; j++){
			rollMsg += joinStr + (i + 1);
			joinStr = ", ";
		    }
		}
		DitV.write(rollMsg, "", "", msg.who);
	    }
	    break;
	case "count":
	    if (tokens.length <= 2){
		error = "The 'count' command requires one argument: character name";
		break;
	    }
	    var counts = DitV.countChips(tokens[2]);
	    if (typeof(counts) == typeof("")){
		error = counts;
		break;
	    }
	    var countMsg = "&{template:default} {{name=" + tokens[2] + " Chip Count}}";
	    for (var i = 1; i <= DitV.MAX_VALUE; i++){
		if (counts[i]){
		    countMsg += " {{" + i + "=" + counts[i] + "}}";
		}
	    }
	    DitV.write(countMsg, "", "", msg.who);
	    break;
	case "restackChips":
	    if (tokens.length <= 2){
	        error = "The 'restackChips' command rqeuires one argument: character name";
	    }
	    DitV.restackChips(tokens[2])
	    break;
	case "setimage":
	    if (tokens.length <= 2){
		error = "The 'setimage' command requires at least one argument: chip value";
		break;
	    }
	    var value = parseInt(tokens[2]);
	    if ((value <= 0) || (value > DitV.MAX_VALUE)){
		error = "Chip value must be between 1 and " + DitV.MAX_VALUE;
		break;
	    }
	    var imgUrl = "";
	    if (tokens.length > 3){
		imgUrl = tokens[3];
	    }
	    else{
		if ((!msg.selected) || (msg.selected.length != 1) || (msg.selected[0]._type != "graphic")){
		    error = "Must either pass a URL or call setimage with exactly one token selected";
		    break;
		}
		var imgToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
		if (!imgToken){
		    error = "Unable to get selected token";
		    break;
		}
		log("Token URL for value " + value + ": " + imgToken.get('imgsrc'));
		imgUrl = imgToken.get('imgsrc').replace(/[/][^/.]*[.](jpg|png)/, "/thumb.$1");
	    }
	    state.DitV.CHIP_URLS[value] = imgUrl;
	    break;
	case "images":
	    var imgMsg = "&{template:default} {{name=Chip Images}} {{Default=";
	    if (DitV.GENERIC_URL){
		    imgMsg += "[" + DitV.GENERIC_URL + "](" + DitV.GENERIC_URL + ")";
	    }
	    else{
		imgMsg += "undefined";
	    }
	    imgMsg += "}}";
	    for (var i = 1; i <= DitV.MAX_VALUE; i++){
		imgMsg += "{{" + i + "=";
		if (state.DitV.CHIP_URLS[i]){
		    var imgUrl = state.DitV.CHIP_URLS[i].replace(/[?]\d+$/, "");
		    imgMsg += "[" + state.DitV.CHIP_URLS[i] + "](" + state.DitV.CHIP_URLS[i] + ")";
		}
		else{
		    imgMsg += "undefined";
		}
		imgMsg += "}}";
	    }
	    DitV.write(imgMsg, msg.who, "", "DitV");
	    break;
	case "help":
	    DitV.showHelp(msg.who, tokens[0]);
	    break;
	default:
	    DitV.write("Error: Unrecognized command: " + tokens[0], msg.who, "", "DitV");
	    DitV.showHelp(msg.who, tokens[0]);
	}
	if (error){
	    DitV.write("Error: " + error, msg.who, "", "DitV");
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!ditv") !=0 )){ return; }

	return DitV.handleDitVMessage(msg.content.split(" "), msg);
    },

    registerDitV: function(){
	DitV.init();
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!ditv", "!ditv <subcommand> [args]", "Dogs in the Vineyard dice tracker", DitV.handleDitVMessage);
	    if (Shell.write){
		DitV.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", DitV.handleChatMessage);
	}
    }
};

on("ready", function(){ DitV.registerDitV(); });
