var	core = require('./core'),
	ObjectId = require('mongoose').Types.ObjectId,
	models = require('./models'),
	protos = require('./protos'),
	traits = require('./traits');

exports.createRoom = function(roomProps, fromModel) {
	if (typeof fromModel === 'undefined') {
		var fromModel = false;
	}
			
	if (!fromModel) {
		//make sure exits are object IDs.
		core.ensureObjectId(roomProps);
		if ('exits' in roomProps) {
			for (var exitName in roomProps.exits) {
				if (roomProps.exits.hasOwnProperty(exitName)) {
					var exit = roomProps.exits[exitName];
					if (typeof exit !== 'undefined' && exit !== null) {
						if (!(exit instanceof ObjectId)) {
							roomProps.exits[exitName] = new ObjectId(exit);
						}
					}
				}
			}
		}
	}
	
	if (!fromModel) {
		return core.createObject(models.Room, protos.Room, traits.Container, roomProps);
	}
	else {
		return core.createFromModel(roomProps, protos.Room, traits.Container);
	}
};

exports.createMobile = function(mobProps) {
	core.ensureObjectId(mobProps);
	return core.createObject(protos.Mobile, mobProps);
}

exports.createPlayer = function(playerProps) {
	core.ensureObjectId(playerProps);
	return core.createObject(models.Player, protos.Mobile, traits.Player, playerProps);
};

exports.loadRoom = function(objectID, callback) {
	models.Room.findById(objectID, function(err, roomData) {
		var room = exports.createRoom(roomData, true);
		if (err) return callback(err);
		callback(null, room);
	});
}
