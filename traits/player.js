var events = {
	command: function(data) {
		console.log('command for', this.name, 'received: ' + data.command);
	},
	
	move: function(room) {
		this.send(room.title);
		this.send(room.description);
	}
};
		
module.exports = function(socket) {
	function __init(mudObj) {
		if (socket) {
			mudObj.socket = socket;
			socket.on('data', function(data) {
				var args = data.toString().trim().split(' ');
				var cmdData = {
					command: args[0],
					args: args.slice[1],
					string: data.toString().trim()
				};
			
				mubObj.emit('command', cmdData);
			});
		}
	}
	
	var trait = {
		__init: __init,
		events: events,
		socket: null,
		
		connectSocket: function(socket) {
			this.socket = null; //maybe clean up?
			this.socket = socket;
			var self = this;
			socket.on('data', function(data) {
				var args = data.toString().trim().split(' ');
				var cmdData = {
					command: args[0],
					args: args.slice[1],
					string: data.toString().trim()
				};
			
				self.emit('command', cmdData);
			});			
		},
		
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
		},
	};
	

	
	return trait;
}
