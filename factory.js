var	core = require('./core'),
	schemas = require('./schemas'),
	protos = require('./protos'),
	traits = require('./traits');
	
exports.createRoom = function(roomProps) {
	return core.createObject(schemas.Room, protos.Room, traits.Container, roomProps);
};

exports.createMobile = function(mobProps) {
	return core.createObject(protos.Mobile, mobProps);
}

exports.createPlayer = function(playerProps) {
	return core.createObject(schemas.Player, protos.Mobile, traits.Player, playerProps);
};

exports.loadRoom = function(objectID, callback) {
	schemas.Room.findById(objectID, function(err, room) {
		if (err) return callback(err);
		callback(null, room);
	});
}
