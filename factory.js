var	core = require('./core'),
	protos = require('./protos');
	
exports.createRoom = function(roomProps) {
	return mud.createObject(protos.Container, protos.Room, roomProps);
};

exports.createPlayer = function(socket, playerProps) {
	var player = core.createObject(protos.Mobile, protos.Player, playerProps);
	player.socket = socket;

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
	
	return player;
};
