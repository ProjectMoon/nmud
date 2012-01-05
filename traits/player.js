module.exports = {
	events: {
		command: function(data) {
			//...?
		},
		
		move: function(room) {
			//...?
		}
	},
				
	send: function(data) { 
		this.emit('out', data);
	},
	
	sendInvalid: function(data) {
		this.emit('invalid', data);
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
