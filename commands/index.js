var	events = require('events'),
	util = require('util'),
	Command = require('./command').Command,
	builtins = require('./builtins'),
	protos = require('../protos');

exports.Command = Command;

var commandTable = {};

//initial setup for command table; copies all builtins.
for (var command in builtins) {
	commandTable[command] = builtins[command];
}

exports.addCommand = function(command) {
	if (command instanceof Command === false) {
		throw new Error('can only register Command objects.');
	}
	
	commandTable[command.command] = command;
}

exports.removeCommand = function(commandOrName) {
	//commandOrName can be the string name of a command, or the command object
	//itself.
	if (typeof commandOrName === 'string') {
		return delete commandTable[commandOrName];
	}
	else if (commandOrName instanceof Command) {
		return delete commandTable[commandOrName.command];
	}
	else {
		throw new Error('unrecognized object type for command removal.');
	}
}

exports.createHandler = function(context) {
	if (typeof context.room === 'undefined' || typeof context.executor === 'undefined') {
		throw new Error('command context must have room and executor properties.');
	}
	
	if (!context.room.is(protos.Room)) {
		throw new Error('context.room must have the Room prototype.');
	}
	
	var emitter = new events.EventEmitter;
	
	//self-contained handler.
	function exec(text) {
		text = text.trim();
		
		if (text.length === 0) {
			emitter.emit('error', new Error('no command entered'));
		}
		
		var cmdToken = text.split(' ')[0];
		
		if (cmdToken in commandTable === false) {
			emitter.emit('error', new Error('command "' + cmdToken + '" not in command table.'));
		}
		
		var command = commandTable[cmdToken];
		command.parse(text, function(err, parsed) {
			if (err) return emitter.emit('error', err);
			command.analyze(parsed, context, function(err, analyzed) {
				if (err) return emitter.emit('error', err);
				emitter.emit(cmdToken, analyzed, context);
			});
		});		
	}
	
	exec.on = function() {
		emitter.on.apply(emitter, arguments);
	}

	exec.defaultFor = function(cmd) {
		var command = commandTable[cmd];
		if (command) {
			emitter.on(cmd, command.handler);
		}
		else {
			throw new Error('command "' + cmd + '" not in command table');
		}
	}

	exec.defaultAll = function() {
		for (var cmd in commandTable) {
			var command = commandTable[cmd];
			emitter.on(cmd, command.handler);
		}
	}
	
	return exec;
}
