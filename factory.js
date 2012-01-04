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
	return core.createObject(protos.Mobile, traits.Player(socket), playerProps);
};
