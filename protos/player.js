module.exports = {
	events: {
		command: function(data) {
			console.log('command for', this.name, 'received: ' + data.command);
		},
		
		move: function(room) {
			this.send(room.title);
			this.send(room.description);
		}
	},
	
	socket: null,
	
	send: function(data) { 
		this.socket.write(data + '\r\n');
	},
	
	command: function(text) {
		var args = text.trim().split(' ');
		var cmdData = {
			command: args[0],
			args: args.slice[1],
			string: text.trim()
		};
		
		this.emit('command', cmdData);
	}
};
