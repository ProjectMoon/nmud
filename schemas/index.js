var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var RoomSchema = new Schema({
	id: ObjectId,
	title: String,
	description: String,
	exits: {
		north: ObjectId,
		south: ObjectId,
		east: ObjectId,
		west: ObjectId,
		up: ObjectId,
		down: ObjectId
	}
});

var PlayerSchema = new Schema({
	name: String
});

exports.Room = mongoose.model('Room', RoomSchema);
exports.Player = mongoose.model('Player', PlayerSchema);
