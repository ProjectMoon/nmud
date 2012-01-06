var rl = require('readline'),
	mongoose = require('mongoose'),
	transports = require('./transports'),
	factory = require('./factory'),
	world = require('./world'),
	commands = require('./commands');

mongoose.connect('mongodb://localhost/nmud');
world.load(function(err) {
	var player = factory.createPlayer({ name: 'Derp' });
	var start = world.getRoom(0);

	player.room = start;
	player.room.add(player);

	var handler = commands.createMobileHandler(player);
	handler.defaultAll();

	player.on('command', function(cmd) {
		if (cmd === 'quit') {
			t.disconnect();
			mongoose.connection.close();
			process.exit(0);
		}
		handler(cmd);
	});

	handler.on('error', function(err) {
		player.emit('invalid', err.message);
	});

	var t = transports.console(player);
	t.connect();
});
