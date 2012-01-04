var	util = require('util'),
	MUDObject = require('../core').MUDObject,
	protos = require('../protos'),
	traits = require('../traits');

//cascade = LTR, RTL
//scope = room, self, item-in-room
//variables = start with :, end with ? for optional maybe
//variable types = prototypes, 'text', or 'any'
var defaultOpts = {
	command: null, //ex: 'put'
	form: null, //ex: ':item in :bag'
	handler: null,
	cascade: 'none',
	scope: 'room'
};

function Command(opts) {
	for (var prop in defaultOpts) {
		this[prop] = defaultOpts[prop];
	}
	
	for (var prop in opts) {
		this[prop] = opts[prop];
	}
}

function createValidationRegex(form) {
	var tokens = form.split(' ');
	var regex = '';
	
	tokens.forEach(function(token) {
		if (token[0] === ':' && token.slice(-1) === '?') {
			//optional variable
			regex += '.*';
		}
		else if (token[0] === ':') {
			//required variable
			regex += '[\\w\\d]*';
		}
		else {
			//delimiter
			regex += token;
		}
		
		regex += '\\s+';
	});
	
	return regex.substring(0, regex.length - 3); //remove the last \s.
}

function parseForm(form) {
	if (form) {
		var tokens = form.trim().split(' ');
		var variables = [];
		var delims = [];
		
		tokens.forEach(function(token) {
			if (token.indexOf(':') === 0) {
				variables.push(token);
			}
			else {
				delims.push(token);
			}
		});
		
		return {
			variables: variables,
			delims: delims
		};
	}
	else {
		return {
			variables: [],
			delims: []
		};
	}
}

function sanitizeVariable(variable) {
	return variable.replace(/[:\?]/g, '');
}

Command.prototype.parse = function(text, callback) {
	text = text.trim();
	var parsedForm = parseForm(this.form);
	var variables = parsedForm.variables;
	var delims = parsedForm.delims;
	
	//make sure command is in proper form
	if (this.form) {
		var regex = createValidationRegex(this.form);
		if (text.match(regex) === null) {
			return process.nextTick(function() {
				callback(new Error('text does not match command form'));
			});
		}
	}
	else {
		//check for formless commands (i.e. they expect a single word)
		if (text === this.command) {
			return process.nextTick(function() {
				callback(null, {});
			});
		}
		else {
			return process.nextTick(function() {
				callback(new Error('text does not match command form'));
			});
		}
	}
	
	//no variables? no problem.
	if (variables.length === 0) {
		return process.nextTick(function() {
			callback(null, {});
		});
	}
	
	//now the actual parsing.
	var tokens = text.trim().split(' ').slice(1); //slice removes initial token.
	var currParsedToken = '';
	var vIndex = 0;
	var dIndex = 0;
	var parsed = {}; //variable -> parsed token map
	
	for (var c = 0;c < tokens.length; c++) {
		var token = tokens[c];
		if (token !== '') {
			if (token !== delims[dIndex]) {
				currParsedToken += token + ' ';
			}
			else {
				//slice check against ? is for optional variables, e.g., :stuff?
				if (currParsedToken === '' && variables[vIndex].slice(-1) !== '?') {
					return process.nextTick(function() {
						callback(new Error('missing value for variable ' + variables[vIndex]));
					});
				}
				
				if (currParsedToken === '' && variables[vIndex].slice(-1) === '?') {
					parsed[variables[vIndex]] = null;
				}
				else {			
					parsed[variables[vIndex]] = currParsedToken.trim();
				}
				
				currParsedToken = '';
				vIndex++;
				dIndex++;
			}
		}
	}
	
	if (vIndex < variables.length) {
		if (currParsedToken === '' && variables[vIndex].slice(-1) !== '?') {
			return process.nextTick(function() {
				callback(new Error('missing value for variable ' + variables[vIndex]));
			});
		}
		
		if (currParsedToken === '' && variables[vIndex].slice(-1) === '?') {
			parsed[variables[vIndex]] = null;
		}
		else {			
			parsed[variables[vIndex]] = currParsedToken.trim();
		}
	}
	
	process.nextTick(function() {
		callback(null, parsed);
	});
}

//context is { room, executor }
Command.prototype.analyze = function(parsed, context, callback) {
	var cascade = this.cascade;
	var scope;

	switch (this.scope) {
		case 'room':
			scope = context.room;
			break;
		case 'self':
			scope = context.executor;
			break;
		case 'item-in-room':
			//will eventually use room.find
			return process.nextTick(function() {
				callback(new Error('item-in-room not yet supported'));
			});
			break;
		default:
			var self = this;
			return process.nextTick(function() {
				callback(new Error('unsupported scope ' + self.scope));
			});
			break;
	}
	
	if (!scope) {
		return process.nextTick(function() {
			callback(new Error('no scope present.'));
		});
	}
	
	if (!scope.is(traits.Container)) {
		return process.nextTick(function() {
			callback(new Error('scope must have the Container trait.'));
		});
	}
		
	if (this.cascade === 'none') {
		try {
			var analyzed = analyzeNoCascade(parsed, scope, this.types);
			return process.nextTick(function() {
				callback(null, analyzed);
			});
		}
		catch (e) {
			return process.nextTick(function() {
				callback(e);
			});
		}
	}
	else if (this.cascade === 'LTR') {
		try {
			var variables = parseForm(this.form).variables;
			var analyzed = analyzeLTRCascade(parsed, scope, this.types, variables);
		}
		catch (e) {
			return process.nextTick(function() {
				callback(e);
			});
		}
	}
	else if (this.cascade === 'RTL') {
		try {
			var variables = parseForm(this.form).variables;
			var analyzed = analyzeRTLCascade(parsed, scope, this.types, variables);
		}
		catch (e) {
			return process.nextTick(function() {
				callback(e);
			});
		}
	}
	else {
		var self = this;
		return process.nextTick(function() {
			callback(new Error('unrecognized cascade type ' + self.cascade));
		});
	}
}

Command.prototype.handle = function(analyzed, context, handler) {
	if (typeof handler === 'undefined') {
		var handler = this.handler;
	}
	
	if (typeof handler !== 'function') {
		throw new Error('handler must be a function.');
	}
	
	handler(null, analyzed, context);
}

function analyzeNoCascade(parsed, scope, dataTypes) {
	var analyzed = {};
	for (var variable in parsed) {
		if (typeof dataTypes !== 'undefined') {
			var type = dataTypes[sanitizeVariable(variable)];
		}	
		
		//resolve mud objects based on data type. text is the default.
		if (typeof type !== 'undefined') {
			if (type === 'any') {
				var obj = scope.find(parsed[variable]);
			}
			else if (type !== 'text') {
				var obj = scope.find(parsed[variable], type);
			}
			else {
				var obj = parsed[variable];
			}
		}
		else {
			var obj = parsed[variable];
		}
		
		analyzed[sanitizeVariable(variable)] = obj;
	}
	
	return analyzed;
}

function analyzeLTRCascade(parsed, scope, dataTypes, variables) {
	var analyzed = {};
	for (var c = 0; c < variables.length; c++) {
		if (!(scope instanceof MUDObject) || !scope.is(traits.Container)) {
			throw new Error('a cascaded scope did not have the Container trait or was not a MUDObject.');
		}
		
		var variable = variables[c];
		if (typeof dataTypes !== 'undefined') {
			var type = dataTypes[sanitizeVariable(variable)];
		}
		
		//resolve mud objects based on data type. text is the default.
		if (typeof type !== 'undefined') {
			if (type === 'any') {
				var obj = scope.find(parsed[variable]);
			}
			else if (type !== 'text') {
				var obj = scope.find(parsed[variable], type);
			}
			else {
				var obj = parsed[variable];
			}
		}
		else {
			var obj = parsed[variable];
		}
		
		analyzed[sanitizeVariable(variable)] = obj;
		scope = obj;
	}
	
	return analyzed;
}

function analyzeRTLCascade(parsed, scope, dataTypes, variables) {
	var analyzed = {};
	for (var c = variables.length - 1; c >= 0; c--) {
		if (!(scope instanceof MUDObject) || !scope.is(traits.Container)) {
			throw new Error('a cascaded scope did not have the Container trait or was not a MUDObject.');
		}
		
		var variable = variables[c];
		if (typeof dataTypes !== 'undefined') {
			var type = dataTypes[sanitizeVariable(variable)];
		}
		
		//resolve mud objects based on data type. text is the default.
		if (typeof type !== 'undefined') {
			if (type === 'any') {
				var obj = scope.find(parsed[variable]);
			}
			else if (type !== 'text') {
				var obj = scope.find(parsed[variable], type);
			}
			else {
				var obj = parsed[variable];
			}
		}
		else {
			var obj = parsed[variable];
		}
		
		analyzed[sanitizeVariable(variable)] = obj;
		scope = obj;
	}
	
	return analyzed;
}

//exports
exports.Command = Command;
