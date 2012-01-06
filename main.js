var rl = require('readline'),
	mongoose = require('mongoose'),
	transports = require('./transports'),
	factory = require('./factory'),
	world = require('./world'),
	commands = require('./commands');

/*	
var player = factory.createPlayer({
	name: 'Derp'
});

world.build(require('./sampleworld.json'));

var start = world.getRoom(0);

player.room = start;
player.room.add(player);

var handler = commands.createMobileHandler(player);
handler.defaultAll();

player.on('command', function(cmd) {
	handler(cmd);
});

handler.on('error', function(err) {
	player.emit('invalid', err.message);
});

var t = transports.console(player);
t.connect();
*/

var schemas = require('./schemas');

var room1 = factory.createRoom({
	_id: new mongoose.Types.ObjectId(0),
	title: 'Sample Room 1',
	description: 'This is the first sample room.',
	exits: {
		north: new mongoose.Types.ObjectId(1)
	}
});

var room2 = factory.createRoom({
	_id: new mongoose.Types.ObjectId(1),
	title: 'Sample Room 2',
	description: 'This is the second sample room.',
	exits: {
		south: new mongoose.Types.ObjectId(0)
	}
});

mongoose.connect('mongodb://localhost/nmud');
room1.save(function(err) {
	if (err) console.log(err.stack);
	room2.save(function(err) {
		if (err) console.log(err.stack);
		
		world.load(function(err) {
			var player = factory.createPlayer({ name: 'Derp' });
			var start = world.getRoom(0);

			player.room = start;
			player.room.add(player);

			var handler = commands.createMobileHandler(player);
			handler.defaultAll();

			player.on('command', function(cmd) {
				handler(cmd);
			});

			handler.on('error', function(err) {
				player.emit('invalid', err.message);
			});

			var t = transports.console(player);
			t.connect();
		});
	});
});

process.on('SIGINT', function() {
	console.log('removing rooms');
	require('./schemas').Room.remove(function(err) {
		if (err) throw err;
		console.log('rooms removed');
		mongoose.connection.close();
		process.exit(0);
	});
});

