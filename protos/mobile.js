module.exports = {
	get commandContext() {
		return { room: this.room, executor: this };
	},	
	name: '',
	room: null,
	
	move: function(newRoom) {
		//old room
		if (typeof(this.room) != 'undefined' && this.room != null) {
			this.room.emit('leave', this);
			this.room.remove(this);
		}
	
		//new room.
		this.room = newRoom;
		this.emit('move', newRoom);
		newRoom.emit('enter', this);
		this.room.add(this);
	}
};
