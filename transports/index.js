var	rl = require('readline');

exports.console = function(player) {
	function consoleWriter() {
		Array.prototype.forEach.call(arguments, function(text) {
			console.log(text);	
		});
		
		console.log();
		i.prompt();
	}

	player.on('out', consoleWriter);
	player.on('invalid', consoleWriter);

	var i = rl.createInterface(process.stdin, process.stdout, null);
	function connect() {	
		i.setPrompt('nmud> ');
		i.prompt();
		
		i.on('line', function(text) {
			player.emit('command', text);
		});
	}
	
	function disconnect() {
		player.removeListener('out', consoleWriter);
		player.removeListener('invalid', consoleWriter);
		i.close();
		process.stdin.destroy();
	}
	
	var transport = {
		connect: connect,
		disconnect: disconnect
	};
	
	player.transport = transport;
	return transport;
}
