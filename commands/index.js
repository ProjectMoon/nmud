var Command = require('./command').Command,
	builtins = require('./builtins'),
	protos = require('../protos');

exports.Command = Command;

var commandTable = {};

//initial setup for command table; copies all builtins.
for (var command in builtins) {
	commandTable[command] = builtins[command];
}

exports.staticContextHandler = function(context) {
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
				self.handle(analyzed, context, callback);
			});
		});
	}
}

exports.mobileContextHandler = function(mob) {
	if (!mob.is(protos.Mobile)) {
		throw new Error('object does not have the Mobile prototype.');
	}
	
	//(mostly) immutable clone of this command object.
	var self = {};
	for (prop in this) self[prop] = this[prop];
	
	return function(text, handler) {
		text = text.trim();
		if (text.length === 0) {
			return process.nextTick(function() {
				callback(new Error('no command entered'));
			});
		}
		
		var cmdToken = text.split(' ')[0];
		
		if (cmdToken in commandTable === false) {
			return process.nextTick(function() {
				callback(new Error('command "' + cmdToken + '" not in command table.'));
			});
		}
		
		var command = commandTable[cmdToken];
		
		command.parse(text, function(err, parsed) {
			if (err) return callback(err);
			command.analyze(parsed, mob.commandContext, function(err, analyzed) {
				if (err) return callback(err);
				command.handle(analyzed, mob.commandContext, handler);
			});
		});
	}
}

