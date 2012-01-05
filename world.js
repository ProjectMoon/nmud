var	factory = require('./factory');
var theWorld = {};

exports.build = function(world) {
	world.forEach(function(roomData) {
		var room = factory.createRoom(roomData);
		
		if (room.id in theWorld) {
			throw new Error('room id ' + room.id + ' is already used.');
		}
		
		theWorld[room.id] = room;
	});
}

exports.getRoom = function(id) {
	if (!(id in theWorld)) {
		throw new Error('room id ' + id + ' does not exist in the world.');
	}
	
	return theWorld[id];
}

exports.deleteRoom = function(id) {
	if (!(id in theWorld)) {
		throw new Error('room id ' + id + ' does not exist in the world.');
	}
	
	return delete theWorld[id];	
}
