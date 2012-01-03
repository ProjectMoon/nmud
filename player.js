var util = require('util'),
	commands = require('./commands'),
	mobile = require('./mobile');

var PlayerPrototype = {
	send: function(data) { 
		this.socket.write(data + '\r\n');
	}
};

exports.create = function(socket, playerProps) {
	var player = mobile.create(playerProps);
	player.mixin(PlayerPrototype);
	player.socket = socket;
	
	socket.on('data', function(data) {
		player.emit('command', data.toString().trim());
	});
	
	return player;
};

exports.init = function(player) {
 	player.on('command', function(cmd) {
		var cmdFunc = commands.parse(cmd, player.room);
		
		if (cmdFunc) {
			cmdFunc.call(this);
		}
	});
	
	player.on('move', function(room) {
		p.send(room.title);
		p.send(room.description);
	});
};
