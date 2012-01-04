var	events = require('events'),
	util = require('util'),
	protos = require('./protos'),
	traits = require('./traits');

//cascade = LTR, RTL
//scope = room, self, item-in-room
//variables = start with :, end with ? for optional maybe
//variable types = prototypes from protos module, most likely...
var defaultOpts = {
	command: null, //ex: 'put'
	form: null, //ex: ':item in :bag'
	cascade: 'none',
	scope: 'room',
	variables: {
		':something': 'text'
	}
};

function Command(opts) {
	for (var prop in defaultOpts) {
		this[prop] = defaultOpts[prop];
	}
	
	for (var prop in opts) {
		this[prop] = opts[prop];
	}
}

util.inherits(Command, events.EventEmitter);

function parseForm(form) {
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

Command.prototype.staticContextHandler = function(context) {
	if (typeof context.room === 'undefined' || typeof context.executor === 'undefined') {
		throw new Error('context must have room and executor properties.');
	}
	
	if (!context.room.is(protos.Room)) {
		throw new Error('context.room dose not have the Room prototype');
	}
	//(mostly) immutable clone of this command object.
	var self = {};
	for (prop in this) self[prop] = this[prop];
	
	return function(text, callback) {
		self.parse(text, function(err, parsed) {
			if (err) return callback(err);
			self.analyze(parsed, context, function(err, analyzed) {
				if (err) return callback(err);
				callback(null, analyzed);
			});
		});
	}
}

Command.prototype.mobileContextHandler = function(mob) {
	if (!mob.is(protos.Mobile)) {
		throw new Error('object does not have the Mobile prototype.');
	}
	
	//(mostly) immutable clone of this command object.
	var self = {};
	for (prop in this) self[prop] = this[prop];
	
	return function(text, callback) {
		self.parse(text, function(err, parsed) {
			if (err) return callback(err);
			self.analyze(parsed, mob.commandContext, function(err, analyzed) {
				if (err) return callback(err);
				callback(null, analyzed);
			});
		});
	}
}

Command.prototype.parse = function(text, callback) {
	var parsedForm = parseForm(this.form);
	var variables = parsedForm.variables;
	var delims = parsedForm.delims;
	
	//regex check makes sure command is in proper form
	var regex = (this.command + ' ' + this.form).replace(/:\w*/g, '[\\w\\d]*');
	regex = regex.replace(/\s/g, '\\s+');
	
	if (text.match(regex) === null) {
		return process.nextTick(function() {
			callback(new Error('text does not match command form'));
		});
	}
	
	//no variables? no problem.
	if (variables.length === 0) return {};
	
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
				if (currParsedToken === '') {
					return process.nextTick(function() {
						callback(new Error('missing value for variable ' + variables[vIndex]));
					});
				}
				parsed[variables[vIndex]] = currParsedToken.trim();
				currParsedToken = '';
				vIndex++;
				dIndex++;
			}
		}
	}
	
	if (vIndex < variables.length) {
		if (currParsedToken === '') {
			return process.nextTick(function() {
				callback(new Error('missing value for variable ' + variables[vIndex]));
			});
		}
		parsed[variables[vIndex]] = currParsedToken.trim();
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
	
	if (!scope.is(traits.Container)) {
		return process.nextTick(function() {
			callback(new Error('scope must have the Container trait.'));
		});
	}
		
	if (this.cascade === 'none') {
		try {
			var analyzed = analyzeNoCascade(parsed, scope);
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
		return process.nextTick(function() {
			callback(new Error('LTR cascade not yet supported');
		});
	}
	else if (this.cascade === 'RTL') {
		return process.nextTick(function() {
			callback(new Error('RTL cascade not yet supported');
		});
	}
	else {
		var self = this;
		return process.nextTick(function() {
			callback(new Error('unrecognized cascade type ' + self.cascade));
		});
	}
}

function analyzeNoCascade(parsed, scope) {
	var analyzed = {};
	for (var variable in parsed) {
		var obj = scope.find(parsed[variable]);
		analyzed[variable] = obj;
	}
	
	return analyzed;
}
