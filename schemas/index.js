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

exports.Room = mongoose.model('Room', RoomSchema);
