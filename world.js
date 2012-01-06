var	async = require('async'),
	core = require('./core'),
	protos = require('./protos'),
	traits = require('./traits'),
	factory = require('./factory'),
	ObjectId = require('mongoose').Types.ObjectId,
	models = require('./models');

var theWorld = {};

exports.build = function(world, callback) {
	world.forEach(function(roomData) {
		var room = factory.createRoom(roomData);
		
		if (room._id in theWorld) {
			throw new Error('room id ' + room.id + ' is already used.');
		}
		
		theWorld[room._id] = room;
	});
	
	//persist the world to the DB.
	var tasks = [];
	for (roomID in theWorld) {
		var room = theWorld[roomID];
		
		//ensure scope!
		(function(room) {
			tasks.push(function(cb) {
				room.save(function(err) {
					if (err) cb(err);
					else cb(null);
				});
			});
		})(room);
	}
	
	async.parallel(tasks, function(err) {
		if (err) return callback(err);
		callback(null);
	});
}

exports.getRoom = function(id) {
	if (!(id instanceof ObjectId)) {
		id = new ObjectId(id);
	}
	
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

exports.load = function(callback) {
	models.Room.find({}, function(err, roomDocs) {
		if (err) return callback(err);
		
		roomDocs.forEach(function(roomData) {
			var room = factory.createRoom(roomData, true);
			theWorld[room._id] = room;
		});
		
		callback(null, theWorld);
	});
}
