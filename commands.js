var commands = require('./builtins');
commands.merge = function(moreCommands) {
    for (var cmd in moreCommands) { 
        this[cmd] = moreCommands[cmd];
    } 
}

//will handle anything that we know the scope of (room, etc)
//but will not handle anything where scope is a parameter.
//maybe reintroduce variation names instead of just function args.
// $name = find something in current scope (usually room), and set the scope
// to it.
// :name = find something in current scope and add it.
// :name(scope=...) = find something in the specified scope and add it.
// $name(scope=...) = find something in the specified scope and return it
// as a new scope.

var isDelim = function(str) {
	return typeof(str) != 'undefined' && str.length > 0 && str[0] !== ':' && str[0] !== '$';
}

var isIdent = function(str) {
	return typeof(str) != 'undefined' && str.length > 0 && str[0] === ':';
}

var isScope = function(str) {
	return typeof(str) != 'undefined' && str.length > 0 && str[0] === '$';
}

var isRTLCascade = function(variation) {
	var split = variation.split(' ');
	
	if (split.length > 0) {
		return split[split.length - 1][0] === '$';
	}
	else {
		return false;
	}
}

var tokenize = function(text) {
	if (text.trim().length === 0) {
		return;
	}
	
	var tokens = text.split(' ');
	var cmd = tokens[0];
	
	if (tokens.length === 1) {
		return { command: cmd, variation: '', tokens: {} };
	}
	
	tokens = tokens.slice(1);
	var command = commands[cmd];

	for (variation in command) {
		var variationValid = true;
		var cmdTokens = {};
		var variationTokens = variation.split(' ');
		
		//loop through all variation tokens:
			//if we've run out of actual tokens, go to next variation.
			//look ahead once (return undef if nothing ahead)
			//if lookahead startsWith :/$, then the current word is token.
			//else, we have a delimiter. gobble words until delimiter.
		
		var tokenPos = 0;
		TOKEN_LOOP:
		for (var c = 0; c < variationTokens.length; c++) {
			//we've run out of tokens prematurely. break.
			if (typeof(tokens[tokenPos]) == 'undefined') {
				variationValid = false;
				break;
			}
			
			var currVariationToken = variationTokens[c];
			var nextVariationToken = variationTokens[c + 1];
			
			if (isDelim(currVariationToken)) {
				tokenPos++;
				continue;
			}
			
			//if we have a next token, parse single word or up to delim.
			//if next token is undef, we are on the last token.
			if (typeof(nextVariationToken) != 'undefined') {
				//single arg.
				if (nextVariationToken[0] === ':' || nextVariationToken[0] === '$') {
					cmdTokens[currVariationToken] = tokens[c];
					tokenPos++;
				}
				else {
					//delim
					var currToken = '';
					while (tokens[tokenPos] !== nextVariationToken) {
						//prevent infinite loop... this also means this
						//variation is invalid.
						if (tokenPos > tokens.length) {
							variationValid = false;
							break TOKEN_LOOP;
						}
						currToken += ' ' + tokens[tokenPos];
						tokenPos++;
					}			
					
					cmdTokens[currVariationToken] = currToken.trim();
				}
			}
			else {
				var prevVariationToken = variationTokens[c - 1];
				if (!isDelim(prevVariationToken)) {
					//last token must only be a single word.
					if (tokens.length - tokenPos != 1) {
						variationValid = false;
						break;
					}
					
					cmdTokens[currVariationToken] = tokens[tokenPos];
				}
				else {
					var lastToken = '';
					for (var x = tokenPos; x < tokens.length; x++) {
						lastToken += ' ' + tokens[x];
					}
					
					cmdTokens[currVariationToken] = lastToken.trim();
				}
			}
		}
		
		if (variationValid) {
			return { command: cmd, variation: variation, tokens: cmdTokens };
		}
	}
}

//produce a {} of :idents = MUDObjects.
var parse = function(obj, container) {
	//obj can either be already tokenized, or a string in need
	//of tokenizing.
	if (typeof(obj) === 'string') {
		obj = tokenize(obj);
	}
	
	if (typeof(obj) === 'undefined') {
		return;
	}
	
	var variationTokens = obj.variation.split(' ');
	var tokens = obj.tokens;
	var cmdArgs = {};
	
	if (isRTLCascade(obj.variation)) {
		//go through cmd backwards, and set container as
		//necessary.	
		for (var c = variationTokens.length - 1; c >= 0; c--) {
			var variationToken = variationTokens[c];
			var token = tokens[variationToken];
			
			if (isScope(variationToken)) {
				container = container.find(token);
			}
			else if (isIdent(variationToken)) {
				//slice removes :
				cmdArgs[variationToken.slice(1)] = container.find(token);
			}
			else {
				//wat
			}
		}
		
	}
	else {
		//LTR cascade
		for (var c = 0; c < variationTokens.length; c++) {
			var variationToken = variationTokens[c];
			var token = tokens[variationToken];
			
			if (isScope(variationToken)) {
				container = container.find(token);
			}
			else if (isIdent(variationToken)) {
				//slice removes :
				cmdArgs[variationToken.slice(1)] = container.find(token);
			}
			else {
				//wat
			}
		}
	}
	
	return function() {
		var cmd = commands[obj.command];
		if (typeof(cmd) !== 'undefined') f = cmd[obj.variation];
		if (typeof(f) !== 'undefined') f.call(this, cmdArgs);
	}
}

//Export
module.exports.tokenize = tokenize;
module.exports.parse = parse;
module.exports.commandTable = commands;
