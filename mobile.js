var util = require('util'),
	mud = require('./mud'),
	world = require('./world');

var MobilePrototype = {
	name: '',
	room: null,
	
	move: function(newRoom) {
		//old room
		if (typeof(this.room) != 'undefined' && this.room != null) {
			this.room.emit('leave', this);
			this.room.removeMobile(this);
		}
	
		//new room.
		this.room = newRoom;
		this.emit('move', newRoom);
		newRoom.emit('enter', this);
	}
};

exports.create = function(mobileProps) {
	var mobile = mud.createObject();
	mobile.mixin(MobilePrototype, mobileProps);
	return mobile;
}
