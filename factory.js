var	core = require('./core'),
	protos = require('./protos'),
	traits = require('./traits');
	
exports.createRoom = function(roomProps) {
	return core.createObject(traits.Container, protos.Room, roomProps);
};

exports.createMobile = function(mobProps) {
	return core.createObject(protos.Mobile, mobProps);
}

exports.createPlayer = function(socket, playerProps) {
	var player = core.createObject(protos.Mobile, traits.Player(socket), playerProps);
	player.socket = socket;

	/*
	if (socket) {
		socket.on('data', function(data) {
			var args = data.toString().trim().split(' ');
			var cmdData = {
				command: args[0],
				args: args.slice[1],
				string: data.toString().trim()
			};
			
			player.emit('command', cmdData);
		});
	}
	*/
	return player;
};
